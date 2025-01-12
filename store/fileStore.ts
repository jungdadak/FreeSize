import { create } from 'zustand';

interface FileState {
  file: File | null;
  previewUrl: string | null;
  setFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  clearFile: () => void;
  resetFileStore: () => void;
}

export const useFileStore = create<FileState>()((set) => ({
  file: null,
  previewUrl: null,
  setFile: (file) => set({ file }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  clearFile: () => set({ file: null, previewUrl: null }),
  resetFileStore: () => set({ file: null, previewUrl: null }),
}));
