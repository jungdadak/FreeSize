import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageQueueProps } from '../types';
import { QueueItem } from './QueueItem';

export function ImageQueue({
  filteredData,
  selectedImage,
  onImageSelect,
}: ImageQueueProps) {
  return (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 mt-4">
      <CardHeader>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Queue ({filteredData.length})
        </h4>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-32 w-full">
          <div className="flex p-2 gap-2">
            {filteredData.map((item, index) => (
              <QueueItem
                key={index}
                item={item}
                isSelected={
                  selectedImage?.originalFileName === item.originalFileName
                }
                onClick={() => onImageSelect(item)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
