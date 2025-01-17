import { create } from 'zustand';
import { ProcessingOption } from './fileStore';

export interface TransformData {
  s3Key: string;
  processingOptions: ProcessingOption | null;
  originalFileName: string;
  previewUrl: string;
  width: number;
  height: number;
  processedImageUrl?: string; // 처리된 이미지 URL
  error?: string; // 에러 메시지
}

export interface TransformState {
  transformData: TransformData[] | null;
  currentProcessingIndex: number; // 현재 처리 중인 이미지 인덱스
  totalProcessed: number; // 총 처리된 이미지 수
  processing: boolean; // 처리 중 여부

  // 기존 메서드
  setTransformData: (data: TransformData[]) => void;
  resetTransformData: () => void;

  // 새로운 메서드들
  updateProcessingStatus: (
    index: number,
    processedImageUrl?: string,
    error?: string
  ) => void;
  setProcessingStatus: (
    processing: boolean,
    current?: number,
    total?: number
  ) => void;
}

export const useTransformStore = create<TransformState>((set) => ({
  // 기존 상태
  transformData: null,

  // 새로운 상태
  currentProcessingIndex: 0,
  totalProcessed: 0,
  processing: false,

  // 기존 메서드
  setTransformData: (data) => set({ transformData: data }),
  resetTransformData: () =>
    set({
      transformData: null,
      currentProcessingIndex: 0,
      totalProcessed: 0,
      processing: false,
    }),

  // 새로운 메서드들
  updateProcessingStatus: (index, processedImageUrl, error) =>
    set((state) => ({
      transformData: state.transformData
        ? state.transformData.map((item, i) =>
            i === index ? { ...item, processedImageUrl, error } : item
          )
        : null,
    })),

  setProcessingStatus: (processing, current = 0, total = 0) =>
    set({
      processing,
      currentProcessingIndex: current,
      totalProcessed: total,
    }),
}));
