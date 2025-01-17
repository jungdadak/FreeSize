'use client';

import { useEffect, useState } from 'react';
import { useTransformStore } from '@/store/transformStore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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

  // page.tsx
  const sendTransformData = async () => {
    if (!transformData) return;

    try {
      setIsLoading(true);
      setError(null);

      // 여기서 먼저 모든 blob을 base64로 변환
      const dataWithBase64 = await Promise.all(
        transformData.map(async (item) => {
          const response = await fetch(item.previewUrl);
          const blob = await response.blob();

          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result?.toString().split(',')[1];
              resolve(base64data || '');
            };
            reader.readAsDataURL(blob);
          });

          // previewUrl 대신 base64 문자열 전달
          return {
            ...item,
            base64Image: base64, // previewUrl 대신 이것을 사용
          };
        })
      );

      console.log('🚀 Transform 시작');

      const response = await fetch('/api/image/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithBase64),
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
          {transformData?.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <p className="font-medium">{item.originalFileName}</p>
              {item.processingOptions && (
                <p className="text-sm text-gray-500">
                  처리: {item.processingOptions.method}
                  {item.processingOptions.method === 'uncrop' &&
                    ` (${item.processingOptions.aspectRatio})`}
                  {item.processingOptions.method === 'upscale' &&
                    ` (${item.processingOptions.factor})`}
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
