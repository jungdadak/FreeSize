import React from 'react';
import Image from 'next/image';
import { Maximize2, Minimize2, X } from 'lucide-react';
import ImageCompareSlider from '@/components/ImageCompareSlider';
import { TransformData } from '@/store/transformStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  if (!selectedImage.previewUrl || !selectedImage.processedImageUrl) {
    return null;
  }

  const originalDimensions =
    imageInfos[`original_${selectedImage.originalFileName}`]?.dimensions;
  const processedDimensions =
    imageInfos[`processed_${selectedImage.originalFileName}`]?.dimensions;

  const beforeLabel = originalDimensions
    ? `Original (${originalDimensions.width}x${originalDimensions.height})`
    : 'Original';

  const afterLabel = processedDimensions
    ? `${getProcessingText(selectedImage)} (${processedDimensions.width}x${
        processedDimensions.height
      })`
    : getProcessingText(selectedImage);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row w-full justify-center gap-4">
          <Card className="flex-1 bg-black border-gray-800">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-200">
                Original
              </h2>
              <div className="rounded-xl overflow-hidden bg-gray-900 w-full">
                <div className="relative w-full aspect-square md:aspect-auto md:h-96">
                  <Image
                    src={selectedImage.previewUrl}
                    alt="원본 이미지"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="text-sm font-medium text-gray-300">
                  {selectedImage.originalFileName}
                </h3>
                {imageInfos[`original_${selectedImage.originalFileName}`] && (
                  <>
                    <p className="text-xs text-gray-500">
                      {formatDimensions(
                        imageInfos[`original_${selectedImage.originalFileName}`]
                          .dimensions
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {
                        imageInfos[`original_${selectedImage.originalFileName}`]
                          .size
                      }
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 bg-black border-gray-800">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-200">
                Result
              </h2>
              <div className="rounded-xl overflow-hidden bg-gray-900 w-full">
                <div className="relative w-full aspect-square md:aspect-auto md:h-96">
                  <Image
                    src={selectedImage.processedImageUrl}
                    alt="처리된 이미지"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="text-sm font-medium text-gray-300">
                  {getProcessingText(selectedImage)}
                </h3>
                {imageInfos[`processed_${selectedImage.originalFileName}`] && (
                  <>
                    <p className="text-xs text-gray-500">
                      {formatDimensions(
                        imageInfos[
                          `processed_${selectedImage.originalFileName}`
                        ].dimensions
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {
                        imageInfos[
                          `processed_${selectedImage.originalFileName}`
                        ].size
                      }
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black border-gray-800 max-w-3xl">
          <CardContent>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-200">
                  Side-by-side Comparison
                </h2>
                <Button
                  onClick={() => setIsZoomed(!isZoomed)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 border-gray-700"
                >
                  {isZoomed ? (
                    <>
                      <Minimize2 className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Close</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Maximize</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="relative max-w-2xl  rounded-lg">
                <ImageCompareSlider
                  beforeImage={selectedImage.previewUrl}
                  afterImage={selectedImage.processedImageUrl}
                  beforeLabel={beforeLabel}
                  afterLabel={afterLabel}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maximized View */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-gray-200">
              Comparison View
            </h2>
            <Button
              onClick={() => setIsZoomed(false)}
              variant="outline"
              size="icon"
              className="bg-gray-900 hover:bg-gray-800 border-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="w-full h-full max-h-[calc(100vh-8rem)] relative">
              <ImageCompareSlider
                beforeImage={selectedImage.previewUrl}
                afterImage={selectedImage.processedImageUrl}
                beforeLabel={beforeLabel}
                afterLabel={afterLabel}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
