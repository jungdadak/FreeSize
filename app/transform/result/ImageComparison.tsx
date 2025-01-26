import Image from 'next/image';
import { Maximize2, Minimize2 } from 'lucide-react';
import ImageCompareSlider from '@/components/ImageCompareSlider';
import { TransformData } from '@/store/transformStore';

interface ImageInfo {
  dimensions: {
    width: number;
    height: number;
  };
  size: string;
}

interface ImageComparisonProps {
  selectedImage: TransformData;
  imageInfos: Record<string, ImageInfo>;
  getProcessingText: (item: TransformData) => string;
  formatDimensions: (dimensions: { width: number; height: number }) => string;
  isZoomed: boolean;
  setIsZoomed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ImageComparison = ({
  selectedImage,
  imageInfos,
  getProcessingText,
  formatDimensions,
  isZoomed,
  setIsZoomed,
}: ImageComparisonProps) => {
  return (
    <div className="mb-8">
      <div className="flex w-full justify-center mb-8 gap-1">
        <div className="flex flex-col p-4 flex-1 max-w-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Original</h2>
          <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1e1e1e] w-full">
            <div className="relative w-full h-96">
              <Image
                src={selectedImage.previewUrl}
                alt="원본 이미지"
                fill
                priority
                className="object-contain rounded-xl"
              />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <h3 className="text-sm font-medium text-gray-300 tracking-tight">
              {selectedImage.originalFileName}
            </h3>
            {imageInfos[`original_${selectedImage.originalFileName}`] && (
              <>
                <p className="text-xs text-gray-500 tracking-tight">
                  {formatDimensions(
                    imageInfos[`original_${selectedImage.originalFileName}`]
                      .dimensions
                  )}
                </p>
                <p className="text-xs text-gray-400 tracking-tight">
                  {
                    imageInfos[`original_${selectedImage.originalFileName}`]
                      .size
                  }
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col p-4 flex-1 max-w-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Result</h2>
          <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1e1e1e] w-full">
            {selectedImage.processedImageUrl ? (
              <div className="relative w-full h-96">
                <Image
                  src={selectedImage.processedImageUrl}
                  alt="처리된 이미지"
                  fill
                  priority
                  className="object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
                이미지 처리 중...
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1">
            <h3 className="text-sm font-medium text-gray-300 tracking-tight">
              {getProcessingText(selectedImage)}
            </h3>
            {imageInfos[`processed_${selectedImage.originalFileName}`] && (
              <>
                <p className="text-xs text-gray-500 tracking-tight">
                  {formatDimensions(
                    imageInfos[`processed_${selectedImage.originalFileName}`]
                      .dimensions
                  )}
                </p>
                <p className="text-xs text-gray-400 tracking-tight">
                  {
                    imageInfos[`processed_${selectedImage.originalFileName}`]
                      .size
                  }
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedImage.processedImageUrl && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-200">
              Side-by-side Comparison
            </h2>
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {isZoomed ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Minimize</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Maximize</span>
                </>
              )}
            </button>
          </div>
          <div
            className={`transition-all duration-300 ${
              isZoomed ? 'max-w-full' : 'max-w-[700px]'
            } m-auto`}
          >
            <ImageCompareSlider
              beforeImage={selectedImage.previewUrl}
              afterImage={selectedImage.processedImageUrl}
              beforeLabel={`Original (${
                imageInfos[`original_${selectedImage.originalFileName}`]
                  ?.dimensions.width
              }x${
                imageInfos[`original_${selectedImage.originalFileName}`]
                  ?.dimensions.height
              })`}
              afterLabel={`${getProcessingText(selectedImage)} (${
                imageInfos[`processed_${selectedImage.originalFileName}`]
                  ?.dimensions.width
              }x${
                imageInfos[`processed_${selectedImage.originalFileName}`]
                  ?.dimensions.height
              })`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
