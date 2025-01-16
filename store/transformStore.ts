// store/transformStore.ts
import { create } from 'zustand';
import { ProcessingOption } from './fileStore';

export interface TransformData {
  s3Key: string;
  processingOptions: ProcessingOption | null;
  originalFileName: string;
  previewUrl: string;
  width: number; // 추가
  height: number; // 추가
}

export interface TransformState {
  transformData: TransformData[] | null;
  setTransformData: (data: TransformData[]) => void;
  resetTransformData: () => void;
}

export const useTransformStore = create<TransformState>((set) => ({
  transformData: null,
  setTransformData: (data) => set({ transformData: data }),
  resetTransformData: () => set({ transformData: null }),
}));
