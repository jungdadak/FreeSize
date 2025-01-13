export interface UploadStatus {
  stage: 'idle' | 'getting-url' | 'uploading' | 'processing';
  progress?: number;
  error?: string;
}

export interface PresignedPostResponse {
  url: string;
  fields: Record<string, string>;
}

export interface ProcessMethod {
  id: string;
  label: string;
}
