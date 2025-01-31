// components/Transform/ProcessingSummary/index.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ProcessingSummaryProps } from '@/types/transform';
import { StatusCounters } from './StatusCounters';
import { ProcessingResultsList } from './ProcessingResultsList';

// Fancy하게 수정한 오버레이
import { QueueOverlay } from './QueueOverlay';

export function ProcessingSummary({
  totalCount,
  successCount,
  failureCount,
  processingResults,
  loading,
  onDownloadAll,
  status,
}: ProcessingSummaryProps) {
  return (
    <Card className="bg-white dark:bg-black shadow-lg border-gray-200 dark:border-gray-800 mb-4">
      {/* 헤더 */}
      <CardHeader className="py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Summary ({successCount}/{totalCount})
          </h3>

          {!loading && successCount > 0 && (
            <Button
              onClick={onDownloadAll}
              className="ml-2 bg-indigo-500 dark:bg-white hover:bg-indigo-600
                   dark:hover:bg-indigo-600 text-white dark:text-black
                   hover:text-white h-8 px-2 text-sm"
            >
              <Download size={14} className="mr-1" />
              Success ({successCount})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-2">
        {/* 상단은 그냥 바로 보여주고 */}
        <div className="flex gap-2 mb-4">
          <StatusCounters
            totalCount={totalCount}
            successCount={successCount}
            failureCount={failureCount}
          />
        </div>

        {/* === 여기만 오버레이로 덮어씌움 === */}
        <div className="relative">
          {loading && <QueueOverlay />}
          <ProcessingResultsList results={processingResults} />
        </div>
        {/* ================================== */}

        {/* 프로그레스 바 */}
        {status && (
          <div className="mt-4 w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
            <div
              className={`
                absolute left-0 top-0 h-full
                bg-indigo-500
                ${status.percentage === 100 ? '' : 'stripes-animation'}
              `}
              style={{
                width: `${status.percentage}%`,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
