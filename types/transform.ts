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

// 폴링 로직 관련 파라미터 지정
export const POLLING_INTERVAL =
  Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL) || 4000;
export const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 4000;
export const MAX_RETRIES = Number(process.env.NEXT_PUBLIC_MAX_RETRIES) || 7;

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
