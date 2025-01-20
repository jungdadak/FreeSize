import { create } from 'zustand';
import { ProcessingOption } from './fileStore';

export interface TransformData {
  s3Key: string;
  file: File; // file 추가
  processingOptions: ProcessingOption | null;
  originalFileName: string;
  previewUrl: string;
  width: number;
  height: number;
  processedImageUrl?: string;
  error?: string;
}

export interface TransformState {
  // 기존 상태
  transformData: TransformData[] | null;
  currentProcessingIndex: number;
  totalProcessed: number;
  processing: boolean;
  showResults: boolean; // 결과 화면 표시 여부

  // 액션
  updateS3Key: (fileName: string, s3Key: string) => void;
  updateProcessedImage: (fileName: string, imageUrl: string) => void;
  setTransformData: (data: TransformData[]) => void;
  resetTransformData: () => void;
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
  setShowResults: (show: boolean) => void;
}

export const useTransformStore = create<TransformState>((set) => ({
  // 상태 초기값
  transformData: null,
  currentProcessingIndex: 0,
  totalProcessed: 0,
  processing: false,
  showResults: false,

  // 액션 정의
  setTransformData: (data) => set({ transformData: data }),

  resetTransformData: () =>
    set({
      transformData: null,
      currentProcessingIndex: 0,
      totalProcessed: 0,
      processing: false,
      showResults: false,
    }),

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

  setShowResults: (show) => set({ showResults: show }),
  updateS3Key: (fileName, s3Key) =>
    set((state) => ({
      transformData:
        state.transformData?.map((item) =>
          item.originalFileName === fileName ? { ...item, s3Key } : item
        ) || null,
    })),

  updateProcessedImage: (fileName, imageUrl) =>
    set((state) => ({
      transformData:
        state.transformData?.map((item) =>
          item.originalFileName === fileName
            ? { ...item, processedImageUrl: imageUrl }
            : item
        ) || null,
    })),
}));
