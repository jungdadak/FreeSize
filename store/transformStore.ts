// store/transformStore.ts
import { create } from 'zustand';
import { ProcessingMethod, ProcessingStatus } from '@/types/index';

export interface TransformData {
  file: File;
  previewUrl: string;
  originalFileName: string;
  s3Key: string;
  dimensions: {
    width: number;
    height: number;
  };
  processingOptions: {
    method: ProcessingMethod;
    factor?: string;
    aspectRatio?: string;
    targetRes?: string;
  };
  processedImageUrl?: string;
  status?: ProcessingStatus;
  pollingUrl?: string;
  error?: string;
}

interface TransformStore {
  transformData: TransformData[] | null;
  setTransformData: (data: TransformData[] | null) => void;
  updateImageStatus: (
    fileName: string,
    updates: Partial<TransformData>
  ) => void;
  reset: () => void;
}

export const useTransformStore = create<TransformStore>((set) => ({
  transformData: null,
  setTransformData: (data) => set({ transformData: data }),
  updateImageStatus: (fileName, updates) =>
    set((state) => ({
      transformData:
        state.transformData?.map((item) =>
          item.originalFileName === fileName ? { ...item, ...updates } : item
        ) || null,
    })),
  reset: () => set({ transformData: null }),
}));
