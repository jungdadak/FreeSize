'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useTransformStore } from '@/store/transformStore';
import type { TransformData } from '@/store/transformStore';
import {
  getImageDimensions,
  formatDimensions,
  type ImageDimensions,
} from '@/utils/image';
import ImageCompareSlider from '@/components/ImageCompareSlider';

interface ImageInfo {
  dimensions: ImageDimensions;
  size: string;
}

export default function TransformResult() {
  const { transformData, showResults } = useTransformStore();
  const router = useRouter();
  const [imageInfos, setImageInfos] = useState<Record<string, ImageInfo>>({});
  const [compareMode, setCompareMode] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!transformData || !showResults) {
      router.push('/transform');
    }
  }, [transformData, showResults, router]);

  useEffect(() => {
    // 이미지 정보 수집
    const loadImageInfos = async () => {
      if (!transformData) return;

      const infos: Record<string, ImageInfo> = {};

      for (const item of transformData) {
        try {
          const originalDimensions = await getImageDimensions(item.previewUrl);
          infos[`original_${item.originalFileName}`] = {
            dimensions: originalDimensions,
            size: await getFileSize(item.previewUrl),
          };

          if (item.processedImageUrl) {
            const processedDimensions = await getImageDimensions(
              item.processedImageUrl
            );
            infos[`processed_${item.originalFileName}`] = {
              dimensions: processedDimensions,
              size: await getFileSize(item.processedImageUrl),
            };
          }
        } catch (error) {
          console.error('이미지 정보 로드 실패:', error);
        }
      }

      setImageInfos(infos);
    };

    loadImageInfos();
  }, [transformData]);

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
    }

    return `${method.toUpperCase()}${option}`;
  };

  if (!transformData) return null;

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-black">
      <div className="mb-8">
        <button
          onClick={() => router.push('/transform')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </button>
        <h1 className="text-2xl font-bold">이미지 처리 결과</h1>
      </div>

      <div className="grid gap-8">
        {transformData.map((item: TransformData, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">
                {item.originalFileName}
              </h2>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getProcessingText(item)}
                </span>
                <button
                  onClick={() =>
                    setCompareMode((prev) => ({
                      ...prev,
                      [item.originalFileName]: !prev[item.originalFileName],
                    }))
                  }
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {compareMode[item.originalFileName]
                    ? '분할 보기'
                    : '슬라이더로 비교'}
                </button>
              </div>
            </div>

            {item.error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                처리 실패: {item.error}
              </div>
            ) : (
              <div className="space-y-8">
                {/* 분할 보기 */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* 원본 이미지 */}
                  <div>
                    <p className="text-sm font-medium mb-2">원본</p>
                    <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.previewUrl}
                        alt="원본"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                        {imageInfos[`original_${item.originalFileName}`] && (
                          <>
                            <p>
                              {formatDimensions(
                                imageInfos[`original_${item.originalFileName}`]
                                  .dimensions
                              )}
                            </p>
                            <p>
                              {
                                imageInfos[`original_${item.originalFileName}`]
                                  .size
                              }
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 처리된 이미지 */}
                  <div>
                    <p className="text-sm font-medium mb-2">처리 결과</p>
                    <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                      {item.processedImageUrl ? (
                        <>
                          <Image
                            src={item.processedImageUrl}
                            alt="처리 결과"
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                            <p>{getProcessingText(item)}</p>
                            {imageInfos[
                              `processed_${item.originalFileName}`
                            ] && (
                              <>
                                <p>
                                  {formatDimensions(
                                    imageInfos[
                                      `processed_${item.originalFileName}`
                                    ].dimensions
                                  )}
                                </p>
                                <p>
                                  {
                                    imageInfos[
                                      `processed_${item.originalFileName}`
                                    ].size
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          처리 결과 없음
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 슬라이더 비교 */}
                {item.processedImageUrl && (
                  <div>
                    <p className="text-sm font-medium mb-2">슬라이더로 비교</p>
                    <ImageCompareSlider
                      beforeImage={item.previewUrl}
                      afterImage={item.processedImageUrl}
                      beforeLabel={`원본 (${
                        imageInfos[`original_${item.originalFileName}`]
                          ?.dimensions.width
                      }x${
                        imageInfos[`original_${item.originalFileName}`]
                          ?.dimensions.height
                      })`}
                      afterLabel={`${getProcessingText(item)} (${
                        imageInfos[`processed_${item.originalFileName}`]
                          ?.dimensions.width
                      }x${
                        imageInfos[`processed_${item.originalFileName}`]
                          ?.dimensions.height
                      })`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
