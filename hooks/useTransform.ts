// hooks/useTransform.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFileStore } from '@/store/fileStore';
import type {
  ProcessStatus,
  TransformData,
  SpringErrorResponse,
} from '@/types';

export const useTransform = (
  transformData: TransformData | null,
  onLog?: (message: string, type?: 'info' | 'success' | 'error') => void
) => {
  const { file } = useFileStore();
  const [status, setStatus] = useState<ProcessStatus>({
    stage: 'uploading',
    progress: 0,
  });

  const hasAttemptedRef = useRef(false);

  const processImage = useCallback(async () => {
    console.log('processImage 호출됨'); // 디버깅용 로그 추가
    if (!file || !transformData || hasAttemptedRef.current) return;

    hasAttemptedRef.current = true;
    onLog?.('이미지 업로드 준비 중...');

    try {
      // S3 업로드
      setStatus({ stage: 'uploading', progress: 0 });
      onLog?.('S3에 이미지 업로드 중...');

      const formData = new FormData();
      Object.entries({ ...transformData.presignedFields, file }).forEach(
        ([key, value]) => formData.append(key, value)
      );

      const uploadResult = await fetch(transformData.presignedUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload to S3');
      }

      onLog?.('이미지 업로드 완료', 'success');

      // Spring 서버 요청
      setStatus({ stage: 'processing', progress: 0 });
      onLog?.('AI 모델에서 이미지 처리 중...');

      const springResponse = await fetch('/api/image/tospring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3Key: transformData.presignedFields.key,
          method: transformData.method,
          originalFileName: transformData.originalFileName,
        }),
      });

      if (!springResponse.ok) {
        let errorData: SpringErrorResponse;
        try {
          errorData = await springResponse.json();
        } catch {
          throw new Error('Spring 서버 응답이 유효한 JSON이 아닙니다.');
        }
        throw new Error(errorData.error || 'Failed to process image');
      }

      onLog?.('이미지 처리 완료!', 'success');
      setStatus({ stage: 'completed' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '처리 중 오류가 발생했습니다';
      onLog?.(errorMessage, 'error');
      setStatus({ stage: 'failed', error: errorMessage });
    }
  }, [file, transformData, onLog]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  // 수동 재시도를 위한 함수
  const handleRetry = useCallback(() => {
    hasAttemptedRef.current = false; // 재시도를 위해 초기화
    processImage();
  }, [processImage]);

  return { status, handleRetry };
};
