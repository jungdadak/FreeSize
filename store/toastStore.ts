// store/toastStore.ts
import { create } from 'zustand';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  showToast: (message: string, variant?: ToastVariant) => void;
  hideToast: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: 'success',
  showToast: (message: string, variant: ToastVariant = 'success') =>
    set({ message, variant }),
  hideToast: () => set({ message: null }),
}));

export default useToastStore;
