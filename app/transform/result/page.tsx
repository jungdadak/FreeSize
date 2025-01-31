// app/transform/result/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTransformStore } from '@/store/transformStore';
import type { TransformData } from '@/store/transformStore';
import { useImageProcessing } from '@/hooks/transform/useImageProcessing';
import { useImageInfo } from '@/hooks/transform';
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
  const [searchQuery] = useState('');

  const { processingStatus, processingResults, loading } =
    useImageProcessing(transformData);
  const { imageInfos } = useImageInfo(transformData, processingStatus);

  useResetStoresOnUnmount();

  // 디버깅을 위한 상태 모니터링
  useEffect(() => {
    console.log('Current processing status:', processingStatus);
    console.log('Processing results:', processingResults);
  }, [processingStatus, processingResults]);

  useEffect(() => {
    if (!transformData) {
      router.push('/');
    }
  }, [transformData, router]);

  // 성공/실패 결과 분리
  const { successfulResults, failedResults } = useMemo(
    () => ({
      successfulResults: processingResults.filter((result) => result.success),
      failedResults: processingResults.filter((result) => !result.success),
    }),
    [processingResults]
  );

  // 성공한 이미지 데이터만 필터링
  const successfulData = useMemo(
    () =>
      transformData?.filter((item) => {
        // 1. 검색어 필터링
        const matchesSearch = item.originalFileName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // 2. 성공한 결과에서 매칭 확인
        const isSuccessful = successfulResults.some(
          (result) => result.originalFileName === item.originalFileName
        );

        return matchesSearch && isSuccessful && !!item.processedImageUrl;
      }) ?? [],
    [transformData, searchQuery, successfulResults]
  );

  // selectedImage 동기화
  useEffect(() => {
    if (
      processingStatus.stage === 'completed' &&
      successfulData.length > 0 &&
      (!selectedImage || !successfulData.includes(selectedImage))
    ) {
      setSelectedImage(successfulData[0]);
    }
  }, [processingStatus.stage, successfulData, selectedImage]);

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
        option = ` ${item.processingOptions.targetRes}`;
        break;
      default:
        option = '';
    }

    return `${method.toUpperCase()}${option}`;
  };

  const handleDownloadAll = async () => {
    if (!successfulData.length) return;

    try {
      await downloadZip(successfulData);
    } catch (error) {
      console.error('ZIP 파일 생성 실패:', error);
    }
  };

  // 로딩 상태나 에러 상태 표시
  const getStatusText = () => {
    if (loading) return '처리 중...';
    if (failedResults.length > 0)
      return `실패: ${failedResults.length}개 이미지`;
    if (successfulResults.length > 0)
      return `완료: ${successfulResults.length}개 이미지`;
    return '대기 중';
  };

  if (!transformData) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-black text-gray-900 pt-20 dark:text-white">
      <main>
        <ProcessingSummary
          totalCount={processingResults.length}
          successCount={successfulResults.length}
          failureCount={failedResults.length}
          // 실패 항목만 → failedResults
          // 성공 항목만 → successfulResults
          // 모두 → processingResults
          processingResults={processingResults} // <-- 전체를 넘김
          loading={loading}
          status={{
            text: getStatusText(),
            percentage: processingStatus.progress,
          }}
          onDownloadAll={handleDownloadAll}
        />

        <ImageQueue
          filteredData={successfulData}
          selectedImage={selectedImage}
          onImageSelect={setSelectedImage}
        />

        {selectedImage && (
          <ImageViewer
            selectedImage={selectedImage}
            imageInfos={imageInfos}
            getProcessingText={getProcessingText}
            formatDimensions={formatDimensions}
            isZoomed={isZoomed}
            setIsZoomed={setIsZoomed}
          />
        )}
      </main>
    </div>
  );
}
