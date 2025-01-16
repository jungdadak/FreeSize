// app/transform/page.tsx

'use client';

import React, { useEffect } from 'react';
import { useTransformStore, TransformData } from '@/store/transformStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileImage } from 'lucide-react';
import Image from 'next/image';

export default function TransformPage() {
  const { transformData } = useTransformStore();
  const router = useRouter();

  useEffect(() => {
    if (!transformData || transformData.length === 0) {
      // transformData가 없으면 메인 페이지로 리디렉션
      router.push('/');
    }
    // 선택적으로, 페이지를 떠날 때 transformData를 초기화할 수 있습니다.
    // 필요에 따라 주석 처리하거나 제거하세요.
    return () => {
      // resetTransformData();
    };
  }, [transformData, router]);

  if (!transformData || transformData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading transform data...</p>
      </div>
    );
  }

  return (
    <div
      className={`
        min-h-screen py-12 transition-colors duration-300 
        bg-white text-gray-900 
        dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 dark:text-gray-100
      `}
    >
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div
          className={`
            flex items-center justify-between rounded-2xl shadow-lg p-8
            bg-white border border-gray-200
            dark:bg-gray-800/80 dark:border-none dark:backdrop-blur-sm
          `}
        >
          <div className="space-y-2">
            <h1
              className={`
                text-3xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-indigo-400 to-violet-400
              `}
            >
              Transform Results
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here are your processed images.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Badge
              variant="secondary"
              className={`
                px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 
                dark:bg-gray-900/80 dark:border-gray-700/50 dark:text-gray-200
              `}
            >
              <FileImage className="w-4 h-4 mr-2" />
              {transformData.length} Files
            </Badge>
          </div>
        </div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {transformData.map((data: TransformData, index: number) => (
          <Card
            key={index}
            className={`
              shadow-xl rounded-2xl border-0 
              bg-white text-gray-900
              dark:bg-gray-800/50 dark:text-gray-100 dark:backdrop-blur-sm
              mb-8
            `}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* 이미지 프리뷰 */}
                <div className="relative lg:w-1/2">
                  <div
                    className={`
                      group relative rounded-xl p-6 transition-all duration-300 hover:shadow-lg
                      bg-gray-100 border border-gray-200
                      dark:bg-gray-900/80 dark:border-none dark:backdrop-blur-sm
                    `}
                  >
                    {/* 상단 정보(파일 번호, 이름) */}
                    <div
                      className={`
                        absolute top-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-lg
                        bg-gray-200/70 
                        dark:bg-black/40
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1 text-sm">
                          File {index + 1}
                        </Badge>
                        <h2 className="text-sm font-medium truncate">
                          {data.originalFileName}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center justify-center w-full aspect-square">
                      <Image
                        src={data.previewUrl}
                        alt={`Transformed ${index + 1}`}
                        width={500}
                        height={500}
                        className="
                          max-h-[500px] object-contain rounded-lg 
                          transition-transform duration-300 group-hover:scale-[1.02]
                        "
                      />
                    </div>

                    {/* 하단 정보(이미지 사이즈) */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                      <Badge
                        variant="secondary"
                        className={`
                          bg-gray-200 text-gray-700 border border-gray-300
                          dark:bg-black/40 dark:text-white
                        `}
                      >
                        {data.width}×{data.height}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`
                          bg-gray-200 text-gray-700 border border-gray-300
                          dark:bg-black/40 dark:text-white
                        `}
                      >
                        {/* 파일 크기 정보가 없다면 필요시 추가 */}
                        {/* 예: sizeMB } MB */}
                        {/* 현재 TransformData에는 size 정보가 없으므로 생략 */}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 처리 옵션 정보 */}
                <div className="lg:w-1/2 space-y-6">
                  <div
                    className={`
                      bg-gray-100 border border-gray-200
                      dark:bg-gray-900/50 dark:border-none dark:backdrop-blur-sm
                      rounded-xl p-6
                    `}
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Processing Options
                    </h3>
                    <div className="space-y-3">
                      {data.processingOptions ? (
                        <div>
                          <p>
                            <strong>Method:</strong>{' '}
                            {getMethodLabel(data.processingOptions.method)}
                          </p>
                          {/* 추가 옵션 표시 */}
                          {data.processingOptions.method === 'uncrop' && (
                            <p>
                              <strong>Aspect Ratio:</strong>{' '}
                              {data.processingOptions.aspectRatio}
                            </p>
                          )}
                          {data.processingOptions.method === 'upscale' && (
                            <p>
                              <strong>Factor:</strong>{' '}
                              {data.processingOptions.factor}
                            </p>
                          )}
                          {/* 'square' 옵션은 아직 구현되지 않았으므로 생략 */}
                        </div>
                      ) : (
                        <p>No processing options selected.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// 처리 방법의 레이블을 가져오는 헬퍼 함수
function getMethodLabel(methodId: string): string {
  const methods: { [key: string]: string } = {
    uncrop: 'Uncrop',
    upscale: 'Upscale',
    square: 'Square',
  };
  return methods[methodId] || methodId;
}
