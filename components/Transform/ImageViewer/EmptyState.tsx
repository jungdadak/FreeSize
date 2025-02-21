//componenets/Transform/ImageViewer/EmptyState.tsx

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mt-2 text-sm text-gray-400">
        ↑ 위 큐에서 이미지를 선택해 주세요
      </div>
      <div className="text-gray-500 dark:text-gray-400">{message}</div>
    </div>
  );
}
