export * from './upload';
export * from './store';
export * from './transform';

//types/transform.ts
export type ProcessingMethod = 'upscale' | 'uncrop' | 'square';
export type ProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ProcessingStatusType {
  stage: 'initial' | 'processing' | 'completed';
  progress: number;
  totalItems: number;
  currentItemIndex: number;
  currentFile: string;
}

// Spring API 응답 타입
export interface SpringApiResponse {
  code: number;
  message: string;
  url: string;
}

// 클라이언트에 전달할 응답 타입
export interface ImageProcessingResponse {
  success: boolean;
  message: string;
  processId: string;
}

export interface ProcessingResult {
  originalFileName: string;
  success: boolean;
  message: string;
  imageUrl?: string; // 안전한 URL
}

export interface ImageInfo {
  dimensions: {
    width: number;
    height: number;
  };
  size: string;
}

export interface ProcessingStatusType {
  stage: 'initial' | 'processing' | 'completed';
  progress: number;
  totalItems: number;
  currentItemIndex: number;
  currentFile: string;
}

export interface ImageInfo {
  dimensions: {
    width: number;
    height: number;
  };
  size: string;
}

// API 관련 타입들
export interface SpringApiResponse {
  code: number;
  message: string;
  url: string;
}

export interface ProcessingResult {
  originalFileName: string;
  success: boolean;
  message: string;
}

export interface BaseUploadResult {
  originalFileName: string;
  s3Key: string;
  file: File;
  width: number;
  height: number;
  method: ProcessingMethod;
}

export interface UncropResult extends BaseUploadResult {
  method: 'uncrop';
  aspectRatio: '1:2' | '2:1';
}

export interface UpscaleResult extends BaseUploadResult {
  method: 'upscale';
  factor: 'x1' | 'x2' | 'x4';
}

export interface SquareResult extends BaseUploadResult {
  method: 'square';
  targetRes: '1024' | '1568' | '2048';
}
import type { ImageDimensions } from '@/utils/image';
export interface ImageInfo {
  dimensions: ImageDimensions;
  size: string;
}

export interface ProcessedResult {
  success: boolean;
  resized_img?: string;
  message?: string;
}

export interface SpringAPIResponse {
  success: boolean;
  results: ProcessedResult[];
}
