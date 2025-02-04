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

        const processFormData = new FormData();
        transformData.forEach((item, index) => {
          processFormData.append(`file_${index}`, item.file);
          processFormData.append(
            `method_${index}`,
            item.processingOptions.method
          );
          processFormData.append(
            `metadata_${index}`,
            JSON.stringify({
              taskId: item.s3Key.replace(/\.[^/.]+$/, ''), // s3Key를 taskId로 사용
              originalFileName: item.originalFileName,
              width: item.dimensions.width,
              height: item.dimensions.height,
              ...item.processingOptions,
            })
          );
        });

        console.log('Sending transform request with data:', processFormData);
        const transformResponse = await fetch('/api/image/transform', {
          method: 'POST',
          body: processFormData,
        });

        if (!transformResponse.ok) {
          throw new Error('Transform request failed');
        }

        const { results } = await transformResponse.json();
        console.log('Received transform results:', results);

        for (const [index, result] of results.entries()) {
          if (!result.processId) continue;

          setProcessingStatus((prev) => ({
            ...prev,
            currentItemIndex: index,
            currentFile: result.originalFileName,
          }));

          updateImageStatus(result.originalFileName, {
            status: 'processing',
            pollingUrl: `/api/image/status/${result.processId}`,
          });

          let attempts = 0;
          let isComplete = false;
          let currentRequest: AbortController | null = null;

          while (!isComplete && attempts < MAX_RETRIES) {
            // 이전 요청이 있다면 중단
            if (currentRequest) {
              currentRequest.abort();
            }

            // 새로운 요청 컨트롤러 생성
            currentRequest = new AbortController();

            try {
              // 먼저 대기
              await new Promise((resolve) =>
                setTimeout(resolve, POLLING_INTERVAL)
              );
              attempts++;

              // 상태 체크 요청
              const statusResponse = await fetch('/api/image/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ processId: result.processId }),
                signal: currentRequest.signal,
              });

              if (!statusResponse.ok) {
                throw new Error('Status check failed');
              }

              const statusData = await statusResponse.json();
              console.log(
                `Status check for ${result.originalFileName}:`,
                statusData
              );

              if (statusData.code === 0) {
                updateImageStatus(result.originalFileName, {
                  status: 'completed',
                  processedImageUrl: statusData.imageUrl,
                });
                isComplete = true;
              } else if (statusData.code === 1) {
                // 아직 처리 중
                continue;
              } else {
                // 처리 실패
                throw new Error(statusData.message || 'Processing failed');
              }
            } catch (error: unknown) {
              console.error('Polling error:', error);
              if (error instanceof Error) {
                if (error.name === 'AbortError') {
                  console.log('Request aborted for new polling attempt');
                  continue;
                }
              }
              if (attempts >= MAX_RETRIES) {
                updateImageStatus(result.originalFileName, {
                  status: 'failed',
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Failed to process image',
                });
                break;
              }
            } finally {
              if (isComplete || attempts >= MAX_RETRIES) {
                // 마지막 시도거나 완료되었을 때만 currentRequest를 정리
                if (currentRequest) {
                  currentRequest = null;
                }
              }
            }
          }

          if (!isComplete && attempts >= MAX_RETRIES) {
            console.warn(`Processing timed out for ${result.originalFileName}`);
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
      } catch (error: unknown) {
        console.error('Processing failed:', error);
        transformData.forEach((item) => {
          updateImageStatus(item.originalFileName, {
            status: 'failed',
            error:
              error instanceof Error
                ? error.message
                : 'Failed to process image',
          });
        });
        setProcessingStatus((prev) => ({
          ...prev,
          stage: 'error',
          progress: 100,
        }));
      } finally {
        setLoading(false);
      }
    };

    processImages();
  }, [transformData, updateImageStatus, isProcessingStarted]);

  const processingResults: ProcessingResult[] =
    transformData?.map((item) => ({
      originalFileName: item.originalFileName,
      success: item.status === 'completed',
      message: item.error || '',
    })) || [];

  return {
    processingStatus,
    processingResults,
    loading,
  };
}
