// types/transform.ts

export interface ProcessStatus {
  stage: 'uploading' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  resultUrl?: string; // Added result URL
}

export interface UncropOptions {
  aspectRatio?: '1:1' | '1:2' | '2:1';
  // Add other fields if necessary
}

export interface SpringErrorResponse {
  error?: string;
  // Add other fields if necessary
}
export interface ProcessingMethod {
  id: 'uncrop' | 'upscale';
  label: string;
  enabled: boolean;
}
