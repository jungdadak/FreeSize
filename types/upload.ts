import { FileState } from "./store";

export interface UploadStatus {
	stage: "idle" | "getting-url" | "uploading" | "processing";
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

export interface ImageProcessingOptions {
	enhance: boolean;
	makeSquare: boolean;
	scaleFactor?: number;
	squareMethod: "extend" | "crop";
	targetDimensions: {
		width: number;
		height: number;
	};
}
export interface APIResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	details?: string;
}

// SpringProcessRequest 수정
export interface SpringProcessRequest {
	s3Key: string;
	options: ImageProcessingOptions; // method 대신 options으로 변경
	originalFileName: string;
}
export interface FileStateExtended extends FileState {
	processingOptions: ImageProcessingOptions;
	setProcessingOptions: (options: Partial<ImageProcessingOptions>) => void;
}
