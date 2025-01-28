import { ImageInfo } from '@/types';
import { TransformData } from '@/store/transformStore';
import { Dispatch, SetStateAction } from 'react';
export type ProcessingResult = {
  originalFileName: string;
  success: boolean;
  message: string;
};

export type ProcessingSummaryProps = {
  totalCount: number;
  successCount: number;
  failureCount: number;
  processingResults: ProcessingResult[];
  loading: boolean;
  onDownloadAll: () => void;
};

export type ImageQueueProps = {
  filteredData: TransformData[];
  selectedImage: TransformData | null;
  onImageSelect: (image: TransformData) => void;
};

export type ImageViewerProps = {
  selectedImage: TransformData | null;
  imageInfos: Record<string, ImageInfo>;
  getProcessingText: (item: TransformData) => string;
  formatDimensions: (dimensions: { width: number; height: number }) => string;
  isZoomed: boolean;
  setIsZoomed: Dispatch<SetStateAction<boolean>>; // 수정
};
