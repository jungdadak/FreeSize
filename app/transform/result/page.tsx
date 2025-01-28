// app/transform/result/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransformStore } from '@/store/transformStore';
import type { TransformData } from '@/store/transformStore';
import { useImageProcessing, useImageInfo } from '@/hooks/transform';
import { downloadZip } from '@/utils/download';
import {
  ProcessingSummary,
  ImageQueue,
  ImageViewer,
} from '@/components/Transform';
import { formatDimensions } from '@/utils/image';
import { useResetStoresOnUnmount } from '@/hooks/resetAllStores';

export default function TransformPage() {
  const router = useRouter();
  const { transformData } = useTransformStore();
  const [selectedImage, setSelectedImage] = useState<TransformData | null>(
    null
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [searchQuery] = useState(''); // 검색 기능 추가

  const { processingStatus, processingResults, loading } =
    useImageProcessing(transformData);

  const { imageInfos } = useImageInfo(transformData, processingStatus);
  useResetStoresOnUnmount();
  useEffect(() => {
    if (!transformData) {
      router.push('/');
    }
  }, [transformData, router]);

  // selectedImage 동기화
  useEffect(() => {
    if (
      processingStatus.stage === 'completed' &&
      transformData &&
      processingResults.length > 0
    ) {
      const successfulImage = transformData.find((item) => {
        const result = processingResults.find(
          (r) => r.originalFileName === item.originalFileName
        );
        return result?.success && !!item.processedImageUrl;
      });
      if (successfulImage) setSelectedImage(successfulImage);
    }
  }, [processingStatus.stage, transformData, processingResults]);

  // 처리 텍스트 가져오기
  const getProcessingText = (item: TransformData) => {
    if (!item.processingOptions) return '처리 없음';

    const method = item.processingOptions.method;
    let option = '';

    switch (method) {
      case 'upscale':
        option = ` ${item.processingOptions.factor}`;
        break;
      case 'uncrop':
        option = ` ${item.processingOptions.aspectRatio}`;
        break;
      case 'square':
        option = '';
        break;
      default:
        option = '';
    }

    return `${method.toUpperCase()}${option}`;
  };

  // 원본 코드와 동일한 필터링 로직
  const filteredData =
    transformData?.filter((item) => {
      // 1. 검색어 필터링
      const matchesSearch = item.originalFileName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 2. 처리 성공 여부 필터링
      const processingResult = processingResults.find(
        (result) => result.originalFileName === item.originalFileName
      );
      const isProcessingSuccess = processingResult?.success ?? false;

      // 3. 실제 이미지 URL이 있는지 확인
      const hasProcessedImage = !!item.processedImageUrl;

      return matchesSearch && isProcessingSuccess && hasProcessedImage;
    }) ?? [];

  const handleDownloadAll = async () => {
    if (!transformData) return;

    const successfulImages = transformData.filter(
      (item) => item.processedImageUrl && item.originalFileName
    );

    try {
      await downloadZip(successfulImages);
    } catch (error) {
      console.error('ZIP 파일 생성 실패:', error);
    }
  };

  if (!transformData) {
    return null;
  }

  const totalCount = processingResults.length;
  const successCount = processingResults.filter((r) => r.success).length;
  const failureCount = totalCount - successCount;

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white">
      <main>
        <ProcessingSummary
          totalCount={totalCount}
          successCount={successCount}
          failureCount={failureCount}
          processingResults={processingResults}
          loading={loading}
          onDownloadAll={handleDownloadAll}
        />

        <ImageQueue
          filteredData={filteredData}
          selectedImage={selectedImage}
          onImageSelect={setSelectedImage}
        />

        <ImageViewer
          selectedImage={selectedImage}
          imageInfos={imageInfos}
          getProcessingText={getProcessingText}
          formatDimensions={formatDimensions}
          isZoomed={isZoomed}
          setIsZoomed={setIsZoomed}
        />
      </main>
    </div>
  );
}
