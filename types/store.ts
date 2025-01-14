import { UploadStatus } from "./upload";

export interface FileState {
	file: File | null;
	previewUrl: string | null;
	uploadStatus: UploadStatus;
	setFile: (file: File | null) => void;
	setPreviewUrl: (url: string | null) => void;
	setUploadStatus: (status: UploadStatus) => void;
	resetFileStore: () => void;
}
