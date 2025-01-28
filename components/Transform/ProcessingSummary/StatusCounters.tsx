import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { ProcessingSummaryProps } from '../types';

export function StatusCounters({
  totalCount,
  successCount,
  failureCount,
}: Pick<
  ProcessingSummaryProps,
  'totalCount' | 'successCount' | 'failureCount'
>) {
  return (
    <div className="flex gap-2">
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded px-3 py-1 flex items-center">
        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
          전체 ({totalCount})
        </p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded px-3 py-1 flex items-center">
        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
        <p className="text-sm font-bold text-green-600 dark:text-green-400">
          성공({successCount})
        </p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded px-3 py-1 flex items-center">
        <XCircle className="w-4 h-4 text-red-500 mr-1" />
        <p className="text-sm font-bold text-red-600 dark:text-red-400">
          실패({failureCount})
        </p>
      </div>
    </div>
  );
}
