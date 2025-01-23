'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTransformStore } from '@/store/transformStore';
import type { TransformData } from '@/store/transformStore';
import {
  getImageDimensions,
  formatDimensions,
  type ImageDimensions,
} from '@/utils/image';
import ImageCompareSlider from '@/components/ImageCompareSlider';
import { useFileUpload } from '@/services/uploadService';
import { Maximize2, Minimize2 } from 'lucide-react';

type ProcessingMethod = 'upscale' | 'uncrop' | 'square';

interface BaseUploadResult {
  originalFileName: string;
  s3Key: string;
  file: File;
  width: number;
  height: number;
  method: ProcessingMethod;
}

interface UncropResult extends BaseUploadResult {
  method: 'uncrop';
  aspectRatio: '1:1' | '1:2' | '2:1';
}

interface UpscaleResult extends BaseUploadResult {
  method: 'upscale';
  factor: 'x1' | 'x2' | 'x4';
}

interface SquareResult extends BaseUploadResult {
  method: 'square';
  targetRes: '1024' | '1568' | '2048';
}

interface ImageInfo {
  dimensions: ImageDimensions;
  size: string;
}

interface ProcessedResult {
  success: boolean;
  resized_img?: string;
  message?: string;
}

interface SpringAPIResponse {
  success: boolean;
  results: ProcessedResult[];
}

interface ProcessingStatus {
  stage: 'uploading' | 'processing' | 'completed';
  totalItems: number;
  currentItemIndex: number;
  currentFile: string;
  progress: number;
}

export default function EnhancedImageResultPage() {
  const { transformData } = useTransformStore();
  const router = useRouter();
  const uploadService = useFileUpload();
  const [isZoomed, setIsZoomed] = useState(false);

  const [imageInfos, setImageInfos] = useState<Record<string, ImageInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<TransformData | null>(
    // transformData가 있으면 0번째 이미지 선택, 없으면 null
    transformData && transformData.length > 0 ? transformData[0] : null
  );
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: 'uploading',
    totalItems: 0,
    currentItemIndex: 0,
    currentFile: '',
    progress: 0,
  });
  useEffect(() => {
    if (transformData && transformData.length > 0) {
      // 첫 번째 이미지의 완전한 데이터를 찾아서 설정
      const firstImage = transformData[0];
      if (firstImage) {
        setSelectedImage(firstImage);
      }
    }
  }, [transformData]);

  // transformData의 업데이트를 감지하고 selectedImage를 동기화하는 useEffect
  useEffect(() => {
    if (selectedImage && transformData) {
      const updatedImage = transformData.find(
        (item) => item.originalFileName === selectedImage.originalFileName
      );
      if (updatedImage && updatedImage !== selectedImage) {
        setSelectedImage(updatedImage);
      }
    }
  }, [transformData, selectedImage]);
  // 처리 프로세스 useEffect
  useEffect(() => {
    if (!transformData) {
      router.push('/');
      return;
    }

    const processImages = async () => {
      try {
        // 초기화
        const uploadPromises = transformData.map(async (item, index) => {
          setProcessingStatus((prev) => ({
            ...prev,
            currentItemIndex: index,
            currentFile: item.originalFileName,
            progress: (index / transformData.length) * 100,
          }));

          if (!item.file) return null;

          try {
            const uploadResult = await uploadService.mutateAsync([item.file]);
            return {
              originalFileName: item.originalFileName,
              s3Key: uploadResult[0].s3Key,
              method: item.processingOptions?.method || '',
              file: item.file,
              width: item.width, // width 추가
              height: item.height, // height 추가
              ...(item.processingOptions?.method === 'uncrop' && {
                aspectRatio: item.processingOptions.aspectRatio,
              }),
              ...(item.processingOptions?.method === 'upscale' && {
                factor: item.processingOptions.factor,
              }),
              ...(item.processingOptions?.method === 'square' && {
                targetRes: item.processingOptions.targetRes,
              }),
            };
          } catch (error) {
            console.error(`Failed to upload ${item.originalFileName}:`, error);
            return null;
          }
        });

        const uploadResults = await Promise.all(uploadPromises);
        const validUploads = uploadResults.filter(
          (result): result is NonNullable<typeof result> => result !== null
        );

        // 2. Spring 서버 처리
        setProcessingStatus((prev) => ({
          ...prev,
          stage: 'processing',
          currentFile: '이미지 처리 중...',
          progress: 0,
        }));

        const formData = new FormData();

        // 이후 forEach에서 타입 안전성 보장
        validUploads.forEach((item, index) => {
          formData.append(`file_${index}`, item.file);
          formData.append(`method_${index}`, item.method);

          const metadata = {
            s3Key: item.s3Key,
            width: item.width,
            height: item.height,
            ...(item.method === 'uncrop' && {
              aspectRatio: (item as UncropResult).aspectRatio,
            }),
            ...(item.method === 'upscale' && {
              factor: (item as UpscaleResult).factor,
            }),
            ...(item.method === 'square' && {
              targetRes: (item as SquareResult).targetRes,
            }),
          };

          formData.append(`metadata_${index}`, JSON.stringify(metadata));
        });

        // Spring 서버 요청
        const response = await fetch('/api/image/transform', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Image processing failed');
        }

        const result = (await response.json()) as SpringAPIResponse;

        // 처리 결과 저장
        if (result.results) {
          result.results.forEach(
            (processedResult: ProcessedResult, index: number) => {
              if (processedResult.success) {
                const base64Image = processedResult.resized_img;
                if (base64Image) {
                  useTransformStore

                    .getState()
                    .updateProcessedImage(
                      transformData[index].originalFileName,
                      `data:image/jpeg;base64,${base64Image}`
                    );
                }
              }
            }
          );
        }

        // 완료 처리
        setProcessingStatus((prev) => ({
          ...prev,
          stage: 'completed',
          progress: 100,
        }));
        setLoading(false);
      } catch (error) {
        console.error('Image processing failed:', error);
        setLoading(false);
      }
    };

    processImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 1회만 실행

  // 이미지 정보 수집 useEffect
  useEffect(() => {
    const loadImageInfos = async () => {
      if (!transformData || processingStatus.stage !== 'completed') return;

      try {
        const infos: Record<string, ImageInfo> = {};

        await Promise.all(
          transformData.map(async (item) => {
            try {
              const [originalDimensions, originalSize] = await Promise.all([
                getImageDimensions(item.previewUrl),
                getFileSize(item.previewUrl),
              ]);

              infos[`original_${item.originalFileName}`] = {
                dimensions: originalDimensions,
                size: originalSize,
              };

              if (item.processedImageUrl) {
                const [processedDimensions, processedSize] = await Promise.all([
                  getImageDimensions(item.processedImageUrl),
                  getFileSize(item.processedImageUrl),
                ]);

                infos[`processed_${item.originalFileName}`] = {
                  dimensions: processedDimensions,
                  size: processedSize,
                };
              }
            } catch (error) {
              console.error(`${item.originalFileName} 정보 로드 실패:`, error);
            }
          })
        );

        setImageInfos(infos);
      } catch (error) {
        console.error('이미지 정보 수집 실패:', error);
      }
    };

    loadImageInfos();
  }, [transformData, processingStatus.stage]); // 유틸리티 함수들
  const getFileSize = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const sizeInMB = blob.size / (1024 * 1024);
      return `${sizeInMB.toFixed(2)}MB`;
    } catch (error) {
      console.error('파일 크기 가져오기 실패:', error);
      return 'Unknown size';
    }
  };

  const getProcessingText = (item: TransformData) => {
    if (!item.processingOptions) return '처리 없음';

    const method = item.processingOptions.method;
    let option = '';

    switch (method) {
      case 'upscale':
        option = ` ${item.processingOptions.factor}`;
        break;
      case 'uncrop':
        option = ` ${item.processingOptions.aspectRatio}`;
        break;
      case 'square':
        option = '';
        break;
      default:
        option = '';
    }

    return `${method.toUpperCase()}${option}`;
  };

  if (!transformData) return null;

  // 진행 상태 UI
  if (processingStatus.stage !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-white">
        <div className="w-96 space-y-4">
          <h2 className="text-xl font-semibold text-center">
            {processingStatus.stage === 'uploading'
              ? '파일 업로드 중...'
              : '이미지 처리 중...'}
          </h2>
          <div className="text-sm text-center text-gray-400">
            {processingStatus.stage === 'uploading' &&
              `${processingStatus.currentItemIndex + 1} / ${
                processingStatus.totalItems
              }`}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${processingStatus.progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-400">
            {processingStatus.currentFile}
          </p>
        </div>
      </div>
    );
  } // Filter transformData based on search query
  const filteredData = transformData.filter((item) =>
    item.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#1e1e1e] text-white">
      <main>
        <div className="flex items-center mb-4">
          <h1 className="text-3xl font-semibold">Image Enhancements</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            {/* Selected Image Details */}
            {selectedImage ? (
              <div className="mb-8">
                {/* Before and After Images with Slider */}
                <div className="flex justify-center mb-8">
                  {/* Original Image */}
                  <div className="flex flex-col p-4 w-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-200">
                      Original
                    </h2>
                    <div className="inline-block rounded-xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
                      <div className="h-64 flex items-center justify-start">
                        <Image
                          src={selectedImage.previewUrl}
                          alt="원본 이미지"
                          width={0}
                          height={256}
                          className="h-64 w-auto rounded-xl"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ height: '256px', width: 'auto' }}
                          priority
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <h3 className="text-sm font-medium text-gray-300 tracking-tight">
                        {selectedImage.originalFileName}
                      </h3>
                      {imageInfos[
                        `original_${selectedImage.originalFileName}`
                      ] && (
                        <>
                          <p className="text-xs text-gray-500 tracking-tight">
                            {formatDimensions(
                              imageInfos[
                                `original_${selectedImage.originalFileName}`
                              ].dimensions
                            )}
                          </p>
                          <p className="text-xs text-gray-400 tracking-tight">
                            {
                              imageInfos[
                                `original_${selectedImage.originalFileName}`
                              ].size
                            }
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Image */}
                  <div className="flex flex-col p-4 w-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-200">
                      Result
                    </h2>
                    <div className="inline-block rounded-xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
                      {selectedImage.processedImageUrl ? (
                        <div className="h-64 flex items-center justify-start rounded-xl">
                          <Image
                            src={selectedImage.processedImageUrl}
                            alt="처리된 이미지"
                            width={0}
                            height={256}
                            className="h-64 w-auto rounded-xl"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ height: '256px', width: 'auto' }}
                            priority
                          />
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          이미지 처리 중...
                        </div>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <h3 className="text-sm font-medium text-gray-300 tracking-tight">
                        {getProcessingText(selectedImage)}
                      </h3>
                      {imageInfos[
                        `processed_${selectedImage.originalFileName}`
                      ] && (
                        <>
                          <p className="text-xs text-gray-500 tracking-tight">
                            {formatDimensions(
                              imageInfos[
                                `processed_${selectedImage.originalFileName}`
                              ].dimensions
                            )}
                          </p>
                          <p className="text-xs text-gray-400 tracking-tight">
                            {
                              imageInfos[
                                `processed_${selectedImage.originalFileName}`
                              ].size
                            }
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Compare Slider */}
                {selectedImage.processedImageUrl && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-200">
                        Side-by-side Comparison
                      </h2>
                      <button
                        onClick={() => setIsZoomed(!isZoomed)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        {isZoomed ? (
                          <>
                            <Minimize2 className="w-4 h-4" />
                            <span>Minimize</span>
                          </>
                        ) : (
                          <>
                            <Maximize2 className="w-4 h-4" />
                            <span>Maximize</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div
                      className={`transition-all duration-300 ${
                        isZoomed ? 'max-w-full' : 'max-w-[700px]'
                      } m-auto`}
                    >
                      <ImageCompareSlider
                        beforeImage={selectedImage.previewUrl}
                        afterImage={selectedImage.processedImageUrl}
                        beforeLabel={`Original (${
                          imageInfos[
                            `original_${selectedImage.originalFileName}`
                          ]?.dimensions.width
                        }x${
                          imageInfos[
                            `original_${selectedImage.originalFileName}`
                          ]?.dimensions.height
                        })`}
                        afterLabel={`${getProcessingText(selectedImage)} (${
                          imageInfos[
                            `processed_${selectedImage.originalFileName}`
                          ]?.dimensions.width
                        }x${
                          imageInfos[
                            `processed_${selectedImage.originalFileName}`
                          ]?.dimensions.height
                        })`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-8 text-center text-gray-500">
                선택된 이미지가 없습니다.
              </div>
            )}

            {/* Details Button */}
            <div className="w-[40%] text-center font-bold bg-[#2e2e2e] text-white mt-10 p-3 mx-8 rounded-lg mb-4">
              Queue
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 max-w-full mx-auto p-4">
              {filteredData.map((item: TransformData, index) => (
                <div
                  key={index}
                  className={`space-y-1.5 cursor-pointer border-2 ${
                    selectedImage?.originalFileName === item.originalFileName
                      ? 'border-green-500'
                      : 'border-transparent'
                  } rounded-lg p-2`}
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative aspect-[3/4] w-full">
                    {item.processedImageUrl ? (
                      <Image
                        src={item.processedImageUrl}
                        alt={`Image ${index + 1}`}
                        layout="fill"
                        sizes="(max-width: 144px) 100vw, 144px"
                        className="object-cover rounded-lg"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2E2E2E] rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs truncate px-1">
                    {item.originalFileName}
                  </div>
                  <button
                    className="w-full bg-[#1E1E1E] hover:bg-[#2E2E2E] text-white py-1 rounded-lg text-xs transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Next
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
