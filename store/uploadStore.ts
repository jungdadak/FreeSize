// store/uploadStore.ts
import { create } from 'zustand';

interface UploadState {
  isUploading: boolean;
  currentFileIndex: number;
  currentFileProgress: number;
  stage: 'idle' | 'getting-url' | 'uploading';
  error: string | null;
}

interface UploadStore extends UploadState {
  startUpload: () => void;
  setProgress: (fileIndex: number, progress: number) => void;
  setStage: (stage: UploadState['stage']) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: UploadState = {
  isUploading: false,
  currentFileIndex: 0,
  currentFileProgress: 0,
  stage: 'idle',
  error: null,
};

export const useUploadStore = create<UploadStore>((set) => ({
  ...initialState,
  startUpload: () =>
    set({
      isUploading: true,
      stage: 'getting-url',
      currentFileIndex: 0,
      currentFileProgress: 0,
      error: null,
    }),
  setProgress: (currentFileIndex, currentFileProgress) =>
    set({ currentFileIndex, currentFileProgress }),
  setStage: (stage) => set({ stage }),
  setError: (error) => set({ error, stage: 'idle', isUploading: false }),
  reset: () => set(initialState),
}));
