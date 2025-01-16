'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { useFileStore, FileItem } from '@/store/fileStore';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Loader2, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { getImageDimensions, formatDimensions } from '@/utils/image';
import { PROCESSING_METHODS, ASPECT_RATIOS } from '@/lib/constants';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/** (1) S3 업로드 progress 추적하기 위한 함수 */
async function uploadFileToS3UsingAxios(
  presignedUrl: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    formData.append(k, v);
  });
  formData.append('file', file);

  await axios.post(presignedUrl, formData, {
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress?.(percent);
      }
    },
  });
}

/** (2) store에 이미지 사이즈를 업데이트 */
function setFileDimensions(index: number, width: number, height: number) {
  useFileStore.getState().updateFile(index, {
    dimensions: { width, height },
  });
}

export default function PreviewPage() {
  const router = useRouter();

  /** (3) fileStore로부터 받아오는 것들 */
  const {
    files,
    uploadStatus,
    setUploadStatus,
    resetFileStore,
    setProcessingOption,
  } = useFileStore();

  /** (4) 로컬 state - 업로드중인지 / 현재 파일 index / 진행률(%) */
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFileProgress, setCurrentFileProgress] = useState(0);

  /** (5) 파생값 - 총 개수, 총 용량 */
  const totalFiles = useMemo(() => files.length, [files]);
  const totalSize = useMemo(() => {
    const bytes = files.reduce((acc, item) => acc + item.file.size, 0);
    return (bytes / (1024 * 1024)).toFixed(2); // MB
  }, [files]);

  /** (6) 파일 없으면 /로 리다이렉트 + 이미지 dimensions 로드 */
  useEffect(() => {
    if (files.length === 0) {
      router.push('/');
      return;
    }

    files.forEach(async (fileItem, index) => {
      if (!fileItem.dimensions) {
        try {
          const dims = await getImageDimensions(fileItem.previewUrl);
          setFileDimensions(index, dims.width, dims.height);
        } catch (error) {
          console.error('Error loading image dimensions', error);
        }
      }
    });
  }, [files, router]);

  /** (7) 메서드/옵션 핸들러들 (생략) */
  const handleMethodToggle = (fileIndex: number, methodId: string) => {
    const { processingOption } = files[fileIndex];
    if (processingOption?.method === methodId) {
      setProcessingOption(fileIndex, null);
    } else {
      if (methodId === 'uncrop') {
        setProcessingOption(fileIndex, {
          method: 'uncrop',
          aspectRatio: '1:1',
        });
      } else if (methodId === 'upscale') {
        setProcessingOption(fileIndex, { method: 'upscale', factor: 'x1' });
      } else if (methodId === 'square') {
        setProcessingOption(fileIndex, { method: 'square' });
      }
    }
  };

  const handleAspectRatioChange = (
    fileIndex: number,
    ratio: '1:1' | '1:2' | '2:1'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'uncrop') {
      setProcessingOption(fileIndex, { ...currentOption, aspectRatio: ratio });
    }
  };

  const handleUpscaleFactorChange = (
    fileIndex: number,
    factor: 'x1' | 'x2' | 'x4'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'upscale') {
      setProcessingOption(fileIndex, { ...currentOption, factor });
    }
  };

  const handleRemoveFile = (index: number) => {
    useFileStore.getState().removeFile(index);
  };

  /** (8) Cancel -> 파일 스토어 초기화 후 메인으로 */
  const handleCancel = () => {
    resetFileStore();
    router.push('/');
  };

  /** (9) 업로드 & transform 이동 */
  const handleProcess = async () => {
    if (files.length === 0) return;

    // (9-1) 처리 옵션 체크
    const hasProcessingOptions = files.some(
      (file) => file.processingOption !== null
    );
    if (!hasProcessingOptions) {
      setUploadStatus({
        stage: 'idle',
        error: 'Please select at least one processing option.',
      });
      return;
    }

    try {
      // [1] presigned url 요청중...
      setUploadStatus({ stage: 'getting-url' });
      setIsUploading(true);
      setCurrentFileIndex(0);
      setCurrentFileProgress(0);

      // --------------------------------
      // [2] 파일마다 presigned url + s3Key 받아오기
      //     (route.ts 수정으로 s3Key도 같이 들어옴)
      // --------------------------------
      const presignedRequests = files.map(async (fileItem) => {
        const filename = encodeURIComponent(fileItem.file.name);
        const res = await fetch(`/api/image?file=${filename}`, {
          method: 'GET',
        });
        if (!res.ok) {
          throw new Error(`Failed to get upload URL for ${fileItem.file.name}`);
        }

        const presignedData = await res.json();
        if (!presignedData.success) {
          throw new Error(
            presignedData.error ||
              `Failed to get upload URL for ${fileItem.file.name}`
          );
        }
        // => 여기서 s3Key도 함께 받는다
        // { presigned: { url, fields }, s3Key: uniqueFileName }
        return {
          fileItem,
          presigned: presignedData.data.presigned,
          s3Key: presignedData.data.s3Key,
        };
      });

      const presignedResults = await Promise.all(presignedRequests);

      // --------------------------------
      // [3] 파일 업로드 (progress 표시)
      // --------------------------------
      for (let i = 0; i < presignedResults.length; i++) {
        const { fileItem, presigned } = presignedResults[i];
        setCurrentFileIndex(i + 1); // “n번째 파일 업로드중”
        setCurrentFileProgress(0);

        // 실제 S3 업로드
        await uploadFileToS3UsingAxios(
          presigned.url,
          presigned.fields,
          fileItem.file,
          (percent) => setCurrentFileProgress(percent)
        );
      }

      // --------------------------------
      // [4] 모든 업로드 완료 -> transform 페이지에 s3Key만 넘김
      // --------------------------------
      setUploadStatus({ stage: 'idle', error: '' });

      // transform 페이지로 넘길 배열: s3Key, processingOption 등
      const transformDataArray = presignedResults.map(
        ({ fileItem, s3Key }) => ({
          s3Key, // 업로드 완료된 S3 key
          // 버킷 전체 URL을 만들고 싶으면: `https://YOUR_BUCKET.s3.amazonaws.com/${s3Key}`
          processingOptions: fileItem.processingOption,
          originalFileName: fileItem.file.name,
          previewUrl: fileItem.previewUrl,
        })
      );

      router.push(
        `/transform?data=${encodeURIComponent(
          JSON.stringify(transformDataArray)
        )}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'An unknown error occurred';

      setUploadStatus({
        stage: 'idle',
        error: errorMessage,
      });
      setIsUploading(false);
    }
  };

  // -------------------------------
  // 렌더링
  // -------------------------------
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] py-10">
      {/* 상단 헤더 */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Preview & Process
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Check your images and select processing options
            </p>
          </div>
          <div className="mt-4 sm:mt-0 space-x-4 flex items-center">
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <strong>Total Files:</strong> {totalFiles}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <strong>Total Size:</strong> {totalSize} MB
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          {/* Swiper 캐러셀 */}
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={1}
            className="rounded-lg overflow-hidden"
          >
            {files.map((fileItem: FileItem, index: number) => {
              const sizeMB = (fileItem.file.size / (1024 * 1024)).toFixed(2);

              return (
                <SwiperSlide key={index}>
                  <div className="relative w-full flex flex-col lg:flex-row gap-6">
                    {/* (왼쪽) 이미지 프리뷰 */}
                    <div className="relative flex-shrink-0 w-full lg:w-1/2 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      {/* 제거 버튼 */}
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 p-1 bg-gray-900/50 hover:bg-gray-900/70 rounded-full text-white z-10"
                        aria-label={`Remove file ${fileItem.file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="flex items-center justify-center w-full h-full">
                        <Image
                          src={fileItem.previewUrl}
                          alt={`Preview ${index + 1}`}
                          width={500}
                          height={500}
                          className="max-h-[450px] object-contain rounded-lg"
                        />
                      </div>
                      {/* 이미지 정보 (좌측 하단) */}
                      <div className="absolute bottom-2 left-2 bg-gray-700 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {fileItem.dimensions
                          ? `${fileItem.dimensions.width}×${fileItem.dimensions.height}`
                          : 'Loading...'}{' '}
                        | {sizeMB} MB
                      </div>
                    </div>

                    {/* (오른쪽) 옵션 + 정보 */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-between">
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          File {index + 1}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Name:</strong> {fileItem.file.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Size:</strong> {sizeMB} MB
                        </p>
                        {fileItem.dimensions && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Dimensions:</strong>{' '}
                            {formatDimensions(fileItem.dimensions)}
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <h3 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">
                          Processing Options
                        </h3>
                        <div className="space-y-4">
                          {PROCESSING_METHODS.map((method) => (
                            <div key={method.id} className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${method.id}-${index}`}
                                  checked={
                                    fileItem.processingOption?.method ===
                                    method.id
                                  }
                                  onCheckedChange={() =>
                                    handleMethodToggle(index, method.id)
                                  }
                                />
                                <label
                                  htmlFor={`${method.id}-${index}`}
                                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                  {method.label}
                                </label>
                              </div>

                              {/* uncrop 세부 옵션 */}
                              {method.id === 'uncrop' &&
                                fileItem.processingOption?.method ===
                                  'uncrop' && (
                                  <div className="ml-6">
                                    <RadioGroup
                                      value={
                                        fileItem.processingOption.aspectRatio
                                      }
                                      onValueChange={(value: string) =>
                                        handleAspectRatioChange(
                                          index,
                                          value as '1:1' | '1:2' | '2:1'
                                        )
                                      }
                                      className="flex flex-col space-y-1"
                                    >
                                      {ASPECT_RATIOS.map((ratio) => (
                                        <div
                                          key={ratio.id}
                                          className="flex items-center space-x-2"
                                        >
                                          <RadioGroupItem
                                            value={ratio.id}
                                            id={`${ratio.id}-${index}`}
                                          />
                                          <label
                                            htmlFor={`${ratio.id}-${index}`}
                                            className="text-sm text-gray-700 dark:text-gray-200"
                                          >
                                            {ratio.label}
                                          </label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  </div>
                                )}

                              {/* upscale 세부 옵션 */}
                              {method.id === 'upscale' &&
                                fileItem.processingOption?.method ===
                                  'upscale' && (
                                  <div className="ml-6 space-y-4">
                                    <div className="flex flex-col">
                                      <label className="text-sm mb-1 text-gray-700 dark:text-gray-200">
                                        Upscale Factor
                                      </label>
                                      <RadioGroup
                                        value={fileItem.processingOption.factor}
                                        onValueChange={(value: string) =>
                                          handleUpscaleFactorChange(
                                            index,
                                            value as 'x1' | 'x2' | 'x4'
                                          )
                                        }
                                        className="flex flex-col space-y-1"
                                      >
                                        {[
                                          {
                                            label: 'x1 (Sharpen)',
                                            value: 'x1',
                                          },
                                          { label: 'x2', value: 'x2' },
                                          { label: 'x4', value: 'x4' },
                                        ].map((option) => (
                                          <div
                                            key={option.value}
                                            className="flex items-center space-x-2"
                                          >
                                            <RadioGroupItem
                                              value={option.value}
                                              id={`upscale-${option.value}-${index}`}
                                            />
                                            <label
                                              htmlFor={`upscale-${option.value}-${index}`}
                                              className="text-sm text-gray-700 dark:text-gray-200"
                                            >
                                              {option.label}
                                            </label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                    </div>
                                  </div>
                                )}

                              {/* square 옵션 (미구현) */}
                              {method.id === 'square' &&
                                fileItem.processingOption?.method ===
                                  'square' && (
                                  <div className="ml-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Square option is not yet implemented.
                                    </p>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* 에러 메시지 */}
          {uploadStatus.error && (
            <div className="flex flex-col items-center gap-4 mt-6">
              <p className="text-red-500 dark:text-red-400 font-semibold">
                {uploadStatus.error}
              </p>
              <button
                onClick={() => router.push('/')}
                className="text-purple-500 hover:text-purple-600"
              >
                Go Back to Upload
              </button>
            </div>
          )}

          {/* 업로드 중일 때 진행상황 표시 */}
          {isUploading && (
            <div className="flex flex-col items-center gap-2 mt-6">
              <p className="text-gray-800 dark:text-gray-200">
                Uploading file {currentFileIndex} of {files.length}...
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                Current file progress: {currentFileProgress}%
              </p>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              disabled={uploadStatus.stage !== 'idle'}
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={
                uploadStatus.stage !== 'idle' ||
                !files.some((file) => file.processingOption !== null)
              }
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white rounded-md flex items-center disabled:opacity-50 transition-opacity"
            >
              {uploadStatus.stage === 'getting-url' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Getting ready...
                </>
              ) : (
                'Start Processing'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
