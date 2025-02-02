'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Card, CardContent } from '@/components/ui/card';
import { FileItem } from '@/store/fileStore';
import { useFileProcessing } from '@/hooks/useFileProcessing';

import ImagePreview from '@/components/ImagePreview';
import ProcessingOptions from '@/components/ProcessingOptions';
import Header from '@/components/PreviewHeader';
import ActionButtons from '@/components/ActionButtons';
import SwiperNavigation from '@/components/Swiper/SwiperNavigation';
import CompactUpload from '@/components/CompactUpload';
import GlobalProcessingOptions from '@/components/GlobalProcessingOptions';

import 'swiper/css';
import 'swiper/css/pagination';

export default function PreviewPage() {
  const {
    files,
    totalFiles,
    totalSize,
    uploadStatus,
    addFile,
    stage,
    handleMethodToggle,
    handleAspectRatioChange,
    handleUpscaleFactorChange,
    handleSquareTargetResChange,
    handleRemoveFile,
    handleCancel,
    handleProcess,
  } = useFileProcessing();

  return (
    <div className="min-h-screen pt-20 transition-colors duration-300 bg-white text-gray-900 dark:bg-[#141414]">
      <Header totalFiles={totalFiles} totalSize={totalSize} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlobalProcessingOptions />

        <Card className="border-0 bg-white text-gray-900 dark:bg-[#141414] dark:text-gray-100 dark:backdrop-blur-sm">
          <CardContent className="p-0">
            {files.length > 0 ? (
              <>
                <Swiper spaceBetween={40} slidesPerView={1}>
                  {files.map((fileItem: FileItem, index: number) => (
                    <SwiperSlide key={index} className="p-4">
                      <div className="flex flex-col lg:flex-row gap-8">
                        <ImagePreview
                          fileItem={fileItem}
                          index={index}
                          onRemove={handleRemoveFile}
                        />
                        <div className="lg:w-1/2">
                          <div className="flex flex-col w-full">
                            <ProcessingOptions
                              fileItem={fileItem}
                              index={index}
                              onMethodToggle={handleMethodToggle}
                              onAspectRatioChange={handleAspectRatioChange}
                              onUpscaleFactorChange={handleUpscaleFactorChange}
                              onSquareTargetResChange={
                                handleSquareTargetResChange
                              }
                            />
                          </div>
                          <SwiperNavigation totalFiles={totalFiles} />
                          <div className="mt-1">
                            <CompactUpload
                              onFileAdd={addFile}
                              className="w-full"
                            />
                          </div>{' '}
                          <ActionButtons
                            onCancel={handleCancel}
                            onProcess={handleProcess}
                            stage={stage}
                            uploadStatus={uploadStatus}
                            hasValidOptions={files.every(
                              (file) => file.processingOption !== null
                            )}
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </>
            ) : (
              <div className="p-8">
                <CompactUpload
                  onFileAdd={addFile}
                  className="max-w-xl mx-auto"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
