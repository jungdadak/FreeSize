import { create } from "zustand";
import type { UploadStatus } from "@/types";
import type { ImageDimensions } from "@/utils/image";
import type { ProcessingMethod, ProcessingOptions } from "@/types/processing";

export interface FileState {
	file: File | null;
	previewUrl: string | null;
	dimensions: ImageDimensions | null;
	uploadStatus: UploadStatus;
	selectedMethods: ProcessingMethod[];
	processingOptions: ProcessingOptions; // 추가
	setFile: (file: File | null) => void;
	setPreviewUrl: (url: string | null) => void;
	setDimensions: (dimensions: ImageDimensions | null) => void;
	setUploadStatus: (status: Partial<UploadStatus>) => void;
	setSelectedMethods: (methods: ProcessingMethod[]) => void;
	setProcessingOptions: (options: ProcessingOptions) => void; // 추가
	resetFileStore: () => void;
}

const initialState: Omit<
	FileState,
	| "setFile"
	| "setPreviewUrl"
	| "setDimensions"
	| "setUploadStatus"
	| "setSelectedMethods"
	| "setProcessingOptions"
	| "resetFileStore"
> = {
	file: null,
	previewUrl: null,
	dimensions: null,
	uploadStatus: { stage: "idle" },
	selectedMethods: [],
	processingOptions: {}, // 추가
};

export const useFileStore = create<FileState>()((set) => ({
	...initialState,
	setFile: (file) => set({ file }),
	setPreviewUrl: (url) => set({ previewUrl: url }),
	setDimensions: (dimensions) => set({ dimensions }),
	setUploadStatus: (status) =>
		set((state) => ({ uploadStatus: { ...state.uploadStatus, ...status } })),
	setSelectedMethods: (methods) => set({ selectedMethods: methods }),
	setProcessingOptions: (options) => set({ processingOptions: options }), // 추가
	resetFileStore: () => set(initialState), // 상태만 리셋
}));
