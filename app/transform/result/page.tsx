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

interface ImageInfo {
  dimensions: ImageDimensions;
  size: string;
}

export default function EnhancedImageResultPage() {
  const { transformData, showResults } = useTransformStore();
  const router = useRouter();
  const [imageInfos, setImageInfos] = useState<Record<string, ImageInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<TransformData | null>(
    null
  );

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
      setLoading(false);

      // Initialize the selected image with the first available processed image
      const firstProcessed = transformData.find(
        (item) => item.processedImageUrl
      );
      if (firstProcessed) {
        setSelectedImage(firstProcessed);
      }
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
      default:
        option = '';
    }

    return `${method.toUpperCase()}${option}`;
  };

  if (!transformData) return null;

  // Filter transformData based on search query
  const filteredData = transformData.filter((item) =>
    item.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className=" bg-[#1e1e1e] text-white">
      {/* Main Content */}
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
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {' '}
                  {/* Original Image */}
                  <div className="flex flex-col p-4">
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
                  <div className="flex flex-col p-4">
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
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-start h-64 text-gray-500 dark:text-gray-400">
                          처리 결과 없음
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
                    <ImageCompareSlider
                      className="max-w-[700px] m-auto"
                      beforeImage={selectedImage.previewUrl}
                      afterImage={selectedImage.processedImageUrl}
                      beforeLabel={`원본 (${
                        imageInfos[`original_${selectedImage.originalFileName}`]
                          ?.dimensions.width
                      }x${
                        imageInfos[`original_${selectedImage.originalFileName}`]
                          ?.dimensions.height
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
                )}
              </div>
            ) : (
              <div className="mb-8 text-center text-gray-500">
                선택된 이미지가 없습니다.
              </div>
            )}

            {/* Details Button */}
            <div className="w-[40%] text-center font-bold bg-[#1E1E1E] text-white mt-10 p-3 mx-8 rounded-lg mb-4">
              Queue
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-5 gap-2 max-w-4xl mx-5 p-3">
              {filteredData.map((item: TransformData, index) => (
                <div
                  key={index}
                  className={`space-y-1.5 cursor-pointer border-2 ${
                    selectedImage?.originalFileName === item.originalFileName
                      ? 'border-green-500'
                      : 'border-transparent'
                  } rounded-lg p-1 w-36`}
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
                    className="w-full bg-[#1E1E1E] hover:bg-[#2E2E2E] text-white py-1.5 rounded-lg text-xs transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Next clicked for ${item.originalFileName}`);
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
