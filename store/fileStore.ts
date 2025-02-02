// store/fileStore.ts
import { create } from 'zustand';
import type { UploadStatus } from '@/types';
import type { ImageDimensions } from '@/utils/image';

export interface FileItem {
  file: File;
  previewUrl: string;
  dimensions: ImageDimensions | null;
  processingOption: ProcessingOption | null; // Only one processing option per file
}

export type ProcessingOption =
  | { method: 'uncrop'; aspectRatio: '1:2' | '2:1' }
  | { method: 'upscale'; factor: 'x1' | 'x2' | 'x4' }
  | { method: 'square'; targetRes: '1024' | '1568' | '2048' }; // Placeholder for future implementation

export interface FileState {
  files: FileItem[];
  uploadStatus: UploadStatus;
  setFiles: (files: FileItem[]) => void;
  addFile: (fileItem: FileItem) => void;
  removeFile: (index: number) => void;
  setUploadStatus: (status: Partial<UploadStatus>) => void;
  setProcessingOption: (index: number, option: ProcessingOption | null) => void;
  /** 파일 배열 내 특정 index의 FileItem 부분 업데이트 */
  updateFile: (index: number, updatedData: Partial<FileItem>) => void;
  resetFileStore: () => void;
}

const initialState: Omit<
  FileState,
  | 'setFiles'
  | 'addFile'
  | 'removeFile'
  | 'setUploadStatus'
  | 'setProcessingOption'
  | 'updateFile'
  | 'resetFileStore'
> = {
  files: [],
  uploadStatus: { stage: 'idle' },
};

export const useFileStore = create<FileState>()((set, get) => ({
  ...initialState,

  setFiles: (files) => set({ files }),

  addFile: (fileItem: FileItem) =>
    set((state) => ({ files: [...state.files, fileItem] })),

  removeFile: (index: number) =>
    set((state) => {
      const newFiles = [...state.files];
      const [removed] = newFiles.splice(index, 1);
      URL.revokeObjectURL(removed.previewUrl);
      return { files: newFiles };
    }),

  setUploadStatus: (status) =>
    set((state) => ({
      uploadStatus: { ...state.uploadStatus, ...status },
    })),

  setProcessingOption: (index: number, option: ProcessingOption | null) =>
    set((state) => {
      const updatedFiles = [...state.files];
      updatedFiles[index].processingOption = option;
      return { files: updatedFiles };
    }),

  /** 여기 추가: 특정 index의 FileItem만 부분 업데이트 */
  updateFile: (index: number, updatedData: Partial<FileItem>) =>
    set((state) => {
      const updatedFiles = [...state.files];
      updatedFiles[index] = {
        ...updatedFiles[index],
        ...updatedData,
      };
      return { files: updatedFiles };
    }),

  resetFileStore: () => {
    // Revoke all Blob URLs to prevent memory leaks
    get().files.forEach((fileItem) => URL.revokeObjectURL(fileItem.previewUrl));
    set(initialState);
  },
}));
