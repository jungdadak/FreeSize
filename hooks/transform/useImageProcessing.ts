// hooks/transform/useImageProcessing.ts
import { useState, useEffect, useRef } from 'react';
import { ProcessingStatusType, SpringAPIResponse } from '@/types';
import { useFileUpload } from '@/services/uploadService';
import { TransformData, useTransformStore } from '@/store/transformStore';

export function useImageProcessing(transformData: TransformData[] | null) {
  const processedRef = useRef(false);
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatusType>({
      stage: 'uploading',
      totalItems: 0,
      currentItemIndex: 0,
      currentFile: '',
      progress: 0,
    });

  const [processingResults, setProcessingResults] = useState<
    Array<{
      originalFileName: string;
      success: boolean;
      message: string;
    }>
  >([]);

  const [loading, setLoading] = useState(true);
  const uploadService = useFileUpload();
  const updateProcessedImage = useTransformStore(
    (state) => state.updateProcessedImage
  );

  useEffect(() => {
    if (!transformData || processedRef.current) return;

    processedRef.current = true;

    const processImages = async () => {
      try {
        // Upload Phase
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
              width: item.width,
              height: item.height,
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
        const validUploads = uploadResults.filter(Boolean);

        // Processing Phase
        setProcessingStatus((prev) => ({
          ...prev,
          stage: 'processing',
          currentFile: '이미지 처리 중...',
          progress: 0,
        }));

        const formData = new FormData();
        validUploads.forEach((item, index) => {
          if (!item) return;

          formData.append(`file_${index}`, item.file);
          formData.append(`method_${index}`, item.method);

          const metadata = {
            s3Key: item.s3Key,
            width: item.width,
            height: item.height,
            ...(item.method === 'uncrop' && {
              aspectRatio: item.aspectRatio,
            }),
            ...(item.method === 'upscale' && {
              factor: item.factor,
            }),
            ...(item.method === 'square' && {
              targetRes: item.targetRes,
            }),
          };

          formData.append(`metadata_${index}`, JSON.stringify(metadata));
        });

        const response = await fetch('/api/image/transform', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Image processing failed');
        }

        const result = (await response.json()) as SpringAPIResponse;

        if (result.results) {
          // 단일 상태 업데이트로 모든 결과 처리
          const newResults = result.results.map((processedResult, index) => ({
            originalFileName: transformData[index].originalFileName,
            success: processedResult.success,
            message: processedResult.message || 'Unknown error',
          }));

          // 모든 처리 결과를 한 번에 설정
          setProcessingResults(newResults);

          // 성공한 이미지들을 일괄 처리
          result.results.forEach((processedResult, index) => {
            if (processedResult.success && processedResult.resized_img) {
              updateProcessedImage(
                transformData[index].originalFileName,
                `data:image/jpeg;base64,${processedResult.resized_img}`
              );
            }
          });

          // 상태 업데이트를 마지막에 한 번만 수행
          setProcessingStatus((prev) => ({
            ...prev,
            stage: 'completed',
            progress: 100,
          }));
        }
      } catch (error) {
        console.error('Image processing failed:', error);
      } finally {
        setLoading(false);
      }
    };

    processImages();
  }, [transformData, uploadService, updateProcessedImage]);

  return {
    processingStatus,
    processingResults,
    loading,
  };
}
