//hooks/transform/useImageProcessing.ts
import { useState, useEffect } from 'react';
import { TransformData, useTransformStore } from '@/store/transformStore';
import {
  ProcessingStatusType,
  ProcessingResult,
  MAX_RETRIES,
  POLLING_INTERVAL,
} from '@/types/transform';

export function useImageProcessing(transformData: TransformData[] | null) {
  const updateImageStatus = useTransformStore(
    (state) => state.updateImageStatus
  );
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatusType>({
      stage: 'initial',
      progress: 0,
      totalItems: 0,
      currentItemIndex: 0,
      currentFile: '',
    });
  const [loading, setLoading] = useState(false);

  // 초기 처리 요청을 한 번만 보내기 위한 상태
  const [isProcessingStarted, setIsProcessingStarted] = useState(false);

  useEffect(() => {
    if (!transformData?.length || isProcessingStarted) return;

    const processImages = async () => {
      try {
        setLoading(true);
        setIsProcessingStarted(true);
        setProcessingStatus({
          stage: 'processing',
          progress: 0,
          totalItems: transformData.length,
          currentItemIndex: 0,
          currentFile: transformData[0].originalFileName,
        });

        // 초기 처리 요청
        const formData = new FormData();
        transformData.forEach((item, index) => {
          formData.append(`file_${index}`, item.file);
          formData.append(`method_${index}`, item.processingOptions.method);
          formData.append(
            `metadata_${index}`,
            JSON.stringify({
              s3Key: item.s3Key,
              originalFileName: item.originalFileName,
              width: item.dimensions.width,
              height: item.dimensions.height,
              ...item.processingOptions,
            })
          );
        });

        console.log('Sending initial request...');
        const response = await fetch('/api/image/transform', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to start processing');

        const { results } = await response.json();
        console.log('Received process IDs:', results);

        // 폴링 시작
        for (const [index, result] of results.entries()) {
          if (!result.processId) continue;

          setProcessingStatus((prev) => ({
            ...prev,
            currentItemIndex: index,
            currentFile: result.originalFileName,
          }));

          updateImageStatus(result.originalFileName, { status: 'processing' });

          // 개별 이미지 폴링
          let attempts = 0;
          let isComplete = false;

          while (!isComplete && attempts < MAX_RETRIES) {
            await new Promise((resolve) =>
              setTimeout(resolve, POLLING_INTERVAL)
            );
            attempts++;

            try {
              const statusResponse = await fetch('/api/image/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ processId: result.processId }),
              });

              if (!statusResponse.ok) throw new Error('Status check failed');

              const statusData = await statusResponse.json();
              console.log(`Status check ${attempts}:`, statusData);

              if (statusData.code === 0) {
                updateImageStatus(result.originalFileName, {
                  status: 'completed',
                  processedImageUrl: statusData.imageUrl,
                });
                isComplete = true;
              }
            } catch (error) {
              console.error('Polling error:', error);
              if (attempts >= MAX_RETRIES) {
                updateImageStatus(result.originalFileName, {
                  status: 'failed',
                  error: 'Failed to process image',
                });
                isComplete = true;
              }
            }
          }

          const progress = ((index + 1) / results.length) * 100;
          setProcessingStatus((prev) => ({
            ...prev,
            progress: Math.round(progress),
          }));
        }

        setProcessingStatus((prev) => ({
          ...prev,
          stage: 'completed',
          progress: 100,
        }));
      } catch (error) {
        console.error('Processing failed:', error);
        transformData.forEach((item) => {
          updateImageStatus(item.originalFileName, {
            status: 'failed',
            error: 'Failed to start processing',
          });
        });
        setProcessingStatus((prev) => ({
          ...prev,
          stage: 'completed',
          progress: 100,
        }));
      } finally {
        setLoading(false);
      }
    };

    processImages();
  }, [transformData, updateImageStatus, isProcessingStarted]);

  const currentResults: ProcessingResult[] =
    transformData?.map((item) => ({
      originalFileName: item.originalFileName,
      success: item.status === 'completed',
      message: item.error || '',
    })) || [];

  return {
    processingStatus,
    processingResults: currentResults,
    loading,
  };
}
