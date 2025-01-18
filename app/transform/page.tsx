'use client';

import { useEffect, useState } from 'react';
import { useTransformStore } from '@/store/transformStore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type UncropOption = {
  method: 'uncrop';
  aspectRatio: '1:1' | '1:2' | '2:1';
};

type SquareOption = {
  method: 'square';
};

type UpscaleOption = {
  method: 'upscale';
  factor: 'x1' | 'x2' | 'x4';
};

type ProcessingOption = UncropOption | SquareOption | UpscaleOption;

interface TransformItem {
  originalFileName: string;
  previewUrl: string;
  processingOptions: ProcessingOption | null;
  s3Key: string;
  width: number;
  height: number;
}

export default function TransformPage() {
  const {
    transformData,
    updateProcessingStatus,
    setProcessingStatus,
    setShowResults,
  } = useTransformStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transformData || transformData.length === 0) {
      router.push('/');
    }
  }, [transformData, router]);

  const sendTransformData = async () => {
    if (!transformData) return;

    try {
      setIsLoading(true);
      setError(null);
      setProcessingStatus(true, 0, 0);

      const formData = new FormData();

      await Promise.all(
        transformData.map(async (item: TransformItem, index) => {
          if (!item.processingOptions) return;

          const response = await fetch(item.previewUrl);
          const blob = await response.blob();

          formData.append(`file_${index}`, blob, item.originalFileName);
          formData.append(`method_${index}`, item.processingOptions.method);

          const metadata = {
            s3Key: item.s3Key,
            width: item.width,
            height: item.height,
            ...(item.processingOptions.method === 'uncrop'
              ? {
                  aspectRatio: (item.processingOptions as UncropOption)
                    .aspectRatio,
                }
              : {}),
            ...(item.processingOptions.method === 'upscale'
              ? { factor: (item.processingOptions as UpscaleOption).factor }
              : {}),
          };

          formData.append(`metadata_${index}`, JSON.stringify(metadata));
        })
      );

      console.log('🚀 Transform 시작');

      const response = await fetch('/api/image/transform', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Transform API 요청 실패');
      }

      const { results } = responseData;

      // 각 결과를 매핑하여 저장
      let processedCount = 0;
      transformData.forEach((item, index) => {
        if (!item.processingOptions) return;

        const result = results[processedCount];
        processedCount++;

        if (result.success) {
          // base64 이미지 URL 생성
          const imageUrl = `data:image/jpeg;base64,${
            'uncrop_img' in result ? result.uncrop_img : result.resized_img
          }`;
          updateProcessingStatus(index, imageUrl);
          setProcessingStatus(true, index, processedCount);
        } else {
          updateProcessingStatus(
            index,
            undefined,
            result.message || '이미지 처리 실패'
          );
        }
      });

      // 처리 완료 후 결과 페이지로 이동
      setShowResults(true);
      setProcessingStatus(false);
      router.push('/transform/result');
    } catch (error) {
      console.error('❌ Transform 에러:', error);
      setError(
        error instanceof Error
          ? error.message
          : '이미지 처리 중 오류가 발생했습니다.'
      );
      setProcessingStatus(false);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center mb-8">
          이미지 변환 처리
        </h1>

        {error && (
          <div className="p-4 rounded-lg bg-red-100 text-red-600 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-4">
          {transformData?.map((item: TransformItem, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <p className="font-medium">{item.originalFileName}</p>
              {item.processingOptions && (
                <p className="text-sm text-gray-500">
                  처리: {item.processingOptions.method}
                  {item.processingOptions.method === 'uncrop' &&
                    ` (${
                      (item.processingOptions as UncropOption).aspectRatio
                    })`}
                  {item.processingOptions.method === 'upscale' &&
                    ` (${(item.processingOptions as UpscaleOption).factor})`}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={sendTransformData}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium
            ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              처리 중...
            </>
          ) : (
            '이미지 처리 시작'
          )}
        </button>
      </div>
    </div>
  );
}
