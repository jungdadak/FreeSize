import { Loader2, ChevronRight } from 'lucide-react';

interface ActionButtonsProps {
  onCancel: () => void;
  onProcess: () => void;
  stage: string;
  uploadStatus: { stage: string; error?: string };
  hasValidOptions: boolean;
}

export default function ActionButtons({
  onCancel,
  onProcess,
  stage,
  uploadStatus,
  hasValidOptions,
}: ActionButtonsProps) {
  return (
    <>
      {/* 에러 메시지 */}
      {uploadStatus.error && (
        <div className="mt-6 p-4 rounded-lg bg-red-100 border border-red-300 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p className="text-center">{uploadStatus.error}</p>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200 transition-all duration-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          disabled={uploadStatus.stage !== 'idle'}
        >
          취소
        </button>
        <button
          onClick={onProcess}
          disabled={!hasValidOptions}
          className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 dark:hover:translate-y-[-1px] dark:hover:shadow-lg"
        >
          {stage === 'getting-url' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              준비 중...
            </>
          ) : (
            <>
              처리 시작
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </>
  );
}
