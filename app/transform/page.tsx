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
  processingOptions: ProcessingOption | null; // null 허용으로 변경
  s3Key: string;
  width: number;
  height: number;
}

export default function TransformPage() {
  const { transformData } = useTransformStore();
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

      // 모든 데이터를 하나의 FormData로 구성
      const formData = new FormData();

      await Promise.all(
        transformData.map(async (item: TransformItem, index) => {
          if (!item.processingOptions) return; // processingOptions가 null인 경우 처리 중단

          // Blob 가져오기
          const response = await fetch(item.previewUrl);
          const blob = await response.blob();

          // 각 파일마다 고유한 키로 데이터 추가
          formData.append(`file_${index}`, blob, item.originalFileName);
          formData.append(`method_${index}`, item.processingOptions.method);

          // 메타데이터 구성
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

      if (!response.ok) {
        throw new Error('Transform API 요청 실패');
      }

      const result = await response.json();
      console.log('✨ Transform 응답:', result);
    } catch (error) {
      console.error('❌ Transform 에러:', error);
      setError(
        error instanceof Error
          ? error.message
          : '이미지 처리 중 오류가 발생했습니다.'
      );
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
