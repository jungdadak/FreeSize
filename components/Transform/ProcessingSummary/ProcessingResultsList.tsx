import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ProcessingResult } from '../types';

export function ProcessingResultsList({
  results,
}: {
  results: ProcessingResult[];
}) {
  return (
    <ScrollArea className="h-24 grow rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
      {results.map((result, index) => (
        <div
          key={index}
          className={`flex justify-between items-center mb-1 px-2 py-1 rounded ${
            result.success
              ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30'
              : 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-600/30'
          }`}
        >
          <span className="text-xs text-gray-800 dark:text-gray-200 truncate">
            {result.originalFileName}
          </span>
          <Badge
            className={
              result.success
                ? 'bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-400 text-xs'
                : 'bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 text-xs'
            }
          >
            {result.success ? '성공' : '실패'}
          </Badge>
        </div>
      ))}
    </ScrollArea>
  );
}
