import { useUploadStore } from '@/store/uploadStore';
import { Loader2 } from 'lucide-react';

export const UploadProgress = () => {
  const { isUploading, stage, currentFileIndex, currentFileProgress } =
    useUploadStore();

  console.log('Upload state:', {
    isUploading,
    stage,
    currentFileIndex,
    currentFileProgress,
  });

  // isUploading이 false면 아무것도 렌더링하지 않음
  if (!isUploading) {
    console.log('Not uploading, returning null');
    return null;
  }

  const isComplete = currentFileProgress === 100;

  return (
    <div className="fixed top-4 right-4 left-4 z-50">
      <div className="max-w-2xl mx-auto">
        <div className="p-6 rounded-lg bg-white shadow-lg dark:bg-gray-800">
          <div className="flex flex-col items-center gap-3">
            {!isComplete && (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
            )}
            <div className="space-y-1 text-center w-full">
              <p className="text-indigo-600 dark:text-indigo-400">
                {stage === 'getting-url'
                  ? '업로드 준비 중...'
                  : isComplete
                  ? '파일 업로드 완료'
                  : `파일 업로드 중 ${currentFileIndex}`}
              </p>
              <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2">
                <div
                  className="bg-indigo-600 dark:bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${currentFileProgress}%`,
                  }}
                />
              </div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400">
                {currentFileProgress}% 완료
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
