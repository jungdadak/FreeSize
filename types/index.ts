export * from './upload';
export * from './store';
export * from './transform';

type ProcessingMethod = 'upscale' | 'uncrop' | 'square';

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
  aspectRatio: '1:1' | '1:2' | '2:1';
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

export interface ProcessingStatusType {
  stage: 'uploading' | 'processing' | 'completed';
  totalItems: number;
  currentItemIndex: number;
  currentFile: string;
  progress: number;
}
