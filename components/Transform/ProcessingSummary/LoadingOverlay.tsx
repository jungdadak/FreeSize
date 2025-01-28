import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-500/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-2">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        <p className="text-gray-600 dark:text-gray-300 text-sm">처리중...</p>
      </div>
    </div>
  );
}
