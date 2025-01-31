//components/Transform/ImageViewer/index.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ImageViewerProps } from '../types';
import { ImageComparison } from './ImageComparison';
import { EmptyState } from './EmptyState';

export function ImageViewer({
  selectedImage,
  imageInfos,
  getProcessingText,
  formatDimensions,
  isZoomed,
  setIsZoomed,
}: ImageViewerProps) {
  return (
    <Card className="bg-white dark:bg-black shadow-lg border-gray-200 dark:border-gray-800">
      <CardHeader className="py-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Image Enhancements
        </h3>
      </CardHeader>

      <CardContent className="py-2">
        {selectedImage ? (
          <ImageComparison
            selectedImage={selectedImage}
            imageInfos={imageInfos}
            getProcessingText={getProcessingText}
            formatDimensions={formatDimensions}
            isZoomed={isZoomed}
            setIsZoomed={setIsZoomed}
          />
        ) : (
          <EmptyState message="선택된 이미지가 없습니다." />
        )}
      </CardContent>
    </Card>
  );
}
