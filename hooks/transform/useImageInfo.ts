// hooks/transform/useImageInfo.ts
import { useState, useEffect } from 'react';
import { TransformData } from '@/store/transformStore';
import { ProcessingStatusType } from '@/types/transform';
import { getImageDimensions, getFileSize } from '@/utils/image';
import { ImageInfo } from '@/types';

export function useImageInfo(
  transformData: TransformData[] | null,
  processingStatus: ProcessingStatusType
) {
  const [imageInfos, setImageInfos] = useState<Record<string, ImageInfo>>({});

  useEffect(() => {
    if (!transformData || processingStatus.stage !== 'completed') return;

    const loadImageInfos = async () => {
      try {
        const infos: Record<string, ImageInfo> = {};

        await Promise.all(
          transformData.map(async (item) => {
            try {
              // 원본 이미지 정보 로드
              const [originalDimensions, originalSize] = await Promise.all([
                getImageDimensions(item.previewUrl),
                getFileSize(item.previewUrl),
              ]);

              infos[`original_${item.originalFileName}`] = {
                dimensions: originalDimensions,
                size: originalSize,
              };

              // 처리된 이미지가 있는 경우 해당 정보도 로드
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
              console.error(
                `Failed to load info for ${item.originalFileName}:`,
                error
              );
            }
          })
        );

        setImageInfos(infos);
      } catch (error) {
        console.error('Failed to load image infos:', error);
      }
    };

    loadImageInfos();
  }, [transformData, processingStatus.stage]);

  return { imageInfos };
}
