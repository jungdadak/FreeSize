import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ProcessingSummaryProps } from '../types';
import { StatusCounters } from './StatusCounters';
import { ProcessingResultsList } from './ProcessingResultsList';
import { LoadingOverlay } from './LoadingOverlay';

export function ProcessingSummary({
  totalCount,
  successCount,
  failureCount,
  processingResults,
  loading,
  onDownloadAll,
}: ProcessingSummaryProps) {
  return (
    <Card className="bg-white dark:bg-black shadow-lg border-gray-200 dark:border-gray-800 max-h-48 mb-4">
      <CardHeader className="py-2">
        <div className="flex justify-between items-center">
          <h3 className="text-gray-900 dark:text-white text-lg font-semibold">
            Summary
          </h3>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        {loading && <LoadingOverlay />}
        <div className="flex gap-2">
          <StatusCounters
            totalCount={totalCount}
            successCount={successCount}
            failureCount={failureCount}
          />
          <ProcessingResultsList results={processingResults} />
        </div>
        {!loading && (
          <Button
            onClick={onDownloadAll}
            className="bg-indigo-500 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white dark:text-black hover:text-white h-8 px-2 text-sm m-auto"
          >
            <Download size={14} className="mr-1" />
            Success ({successCount})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
