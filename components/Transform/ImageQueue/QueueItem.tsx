//componenets/Transform/ImageQueue/QueueItem.tsx
import Image from 'next/image';
import { TransformData } from '@/store/transformStore';

type QueueItemProps = {
  item: TransformData;
  isSelected: boolean;
  onClick: () => void;
};

export function QueueItem({ item, isSelected, onClick }: QueueItemProps) {
  const imageUrl = item.previewUrl || item.processedImageUrl;

  return (
    <div
      className={`flex-none w-24 cursor-pointer ${
        isSelected ? 'ring-2 ring-green-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative aspect-square w-full">
        {imageUrl && ( // URL이 있을 때만 Image 컴포넌트 렌더링
          <Image
            src={imageUrl}
            alt={item.originalFileName}
            fill
            className="object-cover rounded"
            priority
          />
        )}
      </div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-1">
        {item.originalFileName}
      </div>
    </div>
  );
}
