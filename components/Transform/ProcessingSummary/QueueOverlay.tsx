import { Loader2 } from 'lucide-react';

interface QueueOverlayProps {
  currentFile?: string;
  progress?: number;
  totalFiles?: number;
  currentIndex?: number;
  stage?: 'uploading' | 'processing' | 'completed';
}

export function QueueOverlay({
  currentFile,
  progress = 0,
  totalFiles = 0,
  currentIndex = 0,
  stage = 'processing',
}: QueueOverlayProps) {
  const getStageText = () => {
    switch (stage) {
      case 'uploading':
        return '이미지 업로드 중...';
      case 'processing':
        return '이미지 처리 중...';
      case 'completed':
        return '처리 완료!';
      default:
        return '처리 중...';
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-blue-600/30 via-indigo-600/30 to-purple-600/30 backdrop-blur-sm">
      <div className="relative flex flex-col items-center p-6 rounded-lg">
        <Loader2 className="w-12 h-12 text-white animate-spin" />

        {/* 현재 처리 단계 */}
        <p className="mt-4 text-lg font-medium text-white">{getStageText()}</p>

        {/* 파일 정보 */}
        {currentFile && (
          <div className="mt-2 text-center">
            <p className="text-sm text-white/90">{currentFile}</p>
            {totalFiles > 1 && (
              <p className="text-sm text-white/75 mt-1">
                {currentIndex + 1} / {totalFiles} 파일
              </p>
            )}
          </div>
        )}

        {/* 진행률 바 */}
        {progress !== undefined && (
          <div className="mt-4 w-64">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-white/90 text-center">
              {Math.round(progress)}% 완료
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
