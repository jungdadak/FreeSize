//componenets/Transform/ImageViewer/EmptyState.tsx

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return <div className="mb-8 text-center text-gray-500">{message}</div>;
}
