import { useState, useEffect } from 'react';
import { ImageInfo, ProcessingStatusType } from '@/types';
import { getImageDimensions, getFileSize } from '@/utils/image';
import { TransformData } from '@/store/transformStore';

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
