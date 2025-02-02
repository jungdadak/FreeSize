// types/transform.ts
export type ProcessingMethod = 'upscale' | 'uncrop' | 'square';
export type ProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ProcessingStatusType {
  stage: ProcessingStage;
  progress: number;
  totalItems: number;
  currentItemIndex: number;
  currentFile: string;
}

export interface ProcessingSummaryProps {
  totalCount: number;
  successCount: number;
  failureCount: number;
  processingResults: ProcessingResult[];
  loading: boolean;
  onDownloadAll: () => void;
  processingStatus?: ProcessingStatusType; // 기존 ProcessingSummary가 이걸 사용하고 있다면 유지
  status?: {
    // 새로운 status 프로퍼티
    text: string;
    percentage: number;
  };
}

// Spring API 응답 타입
export interface SpringApiResponse {
  code: number;
  message: string;
  url: string;
}

// 상수
export const POLLING_INTERVAL = 2000;
export const MAX_RETRIES = 5;

// types/transform.ts
export type ProcessingStage = 'initial' | 'processing' | 'completed' | 'error';

export interface ProcessingStatusType {
  stage: ProcessingStage;
  progress: number;
  totalItems: number;
  currentItemIndex: number;
  currentFile: string;
}

export interface ProcessingResult {
  originalFileName: string;
  success: boolean;
  message?: string;
}
