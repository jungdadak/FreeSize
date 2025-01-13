// types/transform.ts
export interface ProcessStatus {
  stage: 'uploading' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export interface TransformData {
  presignedUrl: string;
  presignedFields: Record<string, string>;
  method: string;
  originalFileName: string;
}
