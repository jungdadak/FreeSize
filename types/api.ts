export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface SpringProcessRequest {
  s3Key: string;
  method: string;
  originalFileName: string;
}
