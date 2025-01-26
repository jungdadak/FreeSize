'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTransformStore } from '@/store/transformStore';
import type { TransformData } from '@/store/transformStore';
import { getImageDimensions, formatDimensions } from '@/utils/image';
import { useFileUpload } from '@/services/uploadService';
import JSZip from 'jszip';
import {
  ImageInfo,
  ProcessingStatusType,
  SpringAPIResponse,
  SquareResult,
  UncropResult,
  UpscaleResult,
} from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ImageComparison } from './ImageComparison';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Download,
  FileText,
  Loader2,
  XCircle,
} from 'lucide-react';
export default function EnhancedImageResultPage() {
  const handleDownloadAll = async () => {
    if (!transformData) return;
    const successfulImages = transformData.filter(
      (item) => item.processedImageUrl && item.originalFileName
    );

    const zip = new JSZip();

    for (const item of successfulImages) {
      try {
        const base64Data = item.processedImageUrl?.split(',')[1];
        if (!base64Data) continue;

        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        zip.file(`processed_${item.originalFileName}`, bytes, { binary: true });
      } catch (error) {
        console.error(`압축 실패: ${item.originalFileName}`, error);
      }
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'processed_images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('ZIP 파일 생성 실패:', error);
    }
  };

  const { transformData } = useTransformStore();
  const router = useRouter();
  const uploadService = useFileUpload();
  const [isZoomed, setIsZoomed] = useState(false);
  const [processingResults, setProcessingResults] = useState<
    { originalFileName: string; success: boolean; message: string }[]
  >([]);

  const [imageInfos, setImageInfos] = useState<Record<string, ImageInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<TransformData | null>(
    // transformData가 있으면 0번째 이미지 선택, 없으면 null
    transformData && transformData.length > 0 ? transformData[0] : null
  );
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatusType>({
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
          // 결과를 이미지와 매핑
          result.results.forEach((processedResult, index) => {
            const originalFileName = transformData[index].originalFileName;

            // `processingResults` 상태 업데이트
            const newResults = result.results.map((processedResult, index) => ({
              originalFileName: transformData[index].originalFileName,
              success: processedResult.success,
              message: processedResult.message || 'Unknown error',
            }));

            setProcessingResults(newResults);

            // 성공한 이미지만 업데이트
            if (processedResult.success) {
              const base64Image = processedResult.resized_img;
              if (base64Image) {
                useTransformStore
                  .getState()
                  .updateProcessedImage(
                    originalFileName,
                    `data:image/jpeg;base64,${base64Image}`
                  );
              }
            }
          });
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

  const totalCount = processingResults.length;
  const successCount = processingResults.filter((r) => r.success).length;
  const failureCount = totalCount - successCount;
  // Filter transformData based on search query
  const filteredData = transformData.filter((item) =>
    item.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#1e1e1e] text-white">
      <main>
        <Card className="bg-[#1e1e1e] shadow-2xl border mb-10 max-w-4xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold text-white">
                Summary
              </CardTitle>
              {!loading && (
                <Button
                  onClick={handleDownloadAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4"
                >
                  <Download size={16} />
                  전체 다운로드 ({successCount})
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {loading && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gray-900 p-6 rounded-xl flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-gray-300">처리중...</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <div className="w-40 space-y-3">
                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                  <FileText className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-100">
                    {totalCount}
                  </p>
                  <p className="text-xs text-gray-400">전체</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-400">
                    {successCount}
                  </p>
                  <p className="text-xs text-gray-400">성공</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                  <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-400">
                    {failureCount}
                  </p>
                  <p className="text-xs text-gray-400">실패</p>
                </div>
              </div>

              <div className="grow space-y-3">
                <ScrollArea className="h-32 rounded-lg border border-green-800/30 bg-black/20 ">
                  {processingResults
                    .filter((result) => result.success)
                    .map((result, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center  mb-2 rounded-lg bg-green-900/20 border border-green-600/30"
                      >
                        <span className="text-sm text-gray-200 truncate">
                          {result.originalFileName}
                        </span>
                        <Badge className="bg-green-600/20 text-green-400">
                          성공
                        </Badge>
                      </div>
                    ))}
                </ScrollArea>

                <ScrollArea className="h-32 rounded-lg border border-red-800/30 bg-black/20">
                  {processingResults
                    .filter((result) => !result.success)
                    .map((result, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center mb-2 rounded-lg bg-red-900/20 border border-red-600/30"
                      >
                        <span className="text-sm text-gray-200 truncate">
                          {result.originalFileName}
                        </span>
                        <Badge className="bg-red-600/20 text-red-400">
                          실패
                        </Badge>
                      </div>
                    ))}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center mb-4">
          <h1 className="text-3xl font-semibold">Image Enhancements</h1>
        </div>

        {/* Selected Image Details */}
        {selectedImage ? (
          <ImageComparison
            selectedImage={selectedImage}
            imageInfos={imageInfos}
            getProcessingText={getProcessingText}
            formatDimensions={formatDimensions}
            isZoomed={isZoomed}
            setIsZoomed={setIsZoomed}
          />
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
                    fill
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
      </main>
    </div>
  );
}
