// store/fileStore.ts
import { create } from 'zustand';
import type { UploadStatus } from '@/types';
import type { ImageDimensions } from '@/utils/image';
import type { ProcessingMethod, ProcessingOptions } from '@/types/transform';

export interface FileItem {
  file: File;
  previewUrl: string;
  dimensions: ImageDimensions | null;
}

export interface FileState {
  files: FileItem[];
  uploadStatus: UploadStatus;
  selectedMethods: ProcessingMethod[];
  processingOptions: ProcessingOptions;
  setFiles: (files: FileItem[]) => void;
  addFile: (fileItem: FileItem) => void;
  removeFile: (index: number) => void;
  setUploadStatus: (status: Partial<UploadStatus>) => void;
  setSelectedMethods: (methods: ProcessingMethod[]) => void;
  setProcessingOptions: (options: ProcessingOptions) => void;
  resetFileStore: () => void;
}

const initialState: Omit<
  FileState,
  | 'setFiles'
  | 'addFile'
  | 'removeFile'
  | 'setUploadStatus'
  | 'setSelectedMethods'
  | 'setProcessingOptions'
  | 'resetFileStore'
> = {
  files: [],
  uploadStatus: { stage: 'idle' },
  selectedMethods: [],
  processingOptions: {},
};

export const useFileStore = create<FileState>()((set, get) => ({
  ...initialState,
  setFiles: (files) => set({ files }),
  addFile: (fileItem) =>
    set((state) => ({ files: [...state.files, fileItem] })),
  removeFile: (index) =>
    set((state) => {
      const newFiles = [...state.files];
      const [removed] = newFiles.splice(index, 1);
      URL.revokeObjectURL(removed.previewUrl);
      return { files: newFiles };
    }),
  setUploadStatus: (status) =>
    set((state) => ({ uploadStatus: { ...state.uploadStatus, ...status } })),
  setSelectedMethods: (methods) => set({ selectedMethods: methods }),
  setProcessingOptions: (options) => set({ processingOptions: options }),
  resetFileStore: () => {
    // 모든 Blob URL을 해제
    get().files.forEach((fileItem) => URL.revokeObjectURL(fileItem.previewUrl));
    set(initialState);
  },
}));
