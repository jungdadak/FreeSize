// store/toastStore.ts
import { create } from 'zustand';

interface ToastState {
  message: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  message: null,
  showToast: (message: string) => set({ message }),
  hideToast: () => set({ message: null }),
}));

export default useToastStore;
