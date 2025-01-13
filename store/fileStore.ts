import { create } from 'zustand';
import { FileState } from '@/types';

const initialState = {
  file: null,
  previewUrl: null,
  uploadStatus: { stage: 'idle' as const },
};

export const useFileStore = create<FileState>()((set) => ({
  ...initialState,
  setFile: (file) => set({ file }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setUploadStatus: (status) =>
    set((state) => ({ uploadStatus: { ...state.uploadStatus, ...status } })),
  resetFileStore: () => set(initialState),
}));
