// hooks/useFileUpload.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/fileStore';
import { MAX_FILE_SIZE, ALLOWED_TYPES } from '@/lib/constants';
import type { PresignedPostResponse, APIResponse } from '@/types';

export const useFileUpload = () => {
  const router = useRouter();
  const { file, previewUrl, setUploadStatus } = useFileStore();
  const [selectedMethod, setSelectedMethod] = useState('');

  const validateFile = () => {
    if (!file) return 'No file selected';
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '지원하지 않는 파일 형식입니다.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return '파일 크기는 10MB를 초과할 수 없습니다.';
    }
    return null;
  };

  const handleProcess = async () => {
    if (!file || !selectedMethod) return;

    const validationError = validateFile();
    if (validationError) {
      setUploadStatus({ stage: 'idle', error: validationError });
      return;
    }

    try {
      setUploadStatus({ stage: 'getting-url' });

      // 1. presignedURL만 받기
      const filename = encodeURIComponent(file.name);
      const res = await fetch('/api/image?file=' + filename, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('Failed to get upload URL');
      }

      const presignedData =
        (await res.json()) as APIResponse<PresignedPostResponse>;

      if (!presignedData.success) {
        throw new Error(presignedData.error || 'Failed to get upload URL');
      }

      // 2. Blob URL 정리
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // 3. transform 페이지로 필요한 데이터 전달
      const transformData = {
        presignedUrl: presignedData.data!.url,
        presignedFields: presignedData.data!.fields,
        method: selectedMethod,
        originalFileName: file.name,
      };

      // 4. transform 페이지로 이동
      router.push(
        `/transform?data=${encodeURIComponent(JSON.stringify(transformData))}`
      );
    } catch (error) {
      setUploadStatus({
        stage: 'idle',
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다',
      });
    }
  };

  return {
    selectedMethod,
    setSelectedMethod,
    handleProcess,
    validateFile,
  };
};
