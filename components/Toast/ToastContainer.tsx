// components/Toast/ToastContainer.tsx
'use client';
import useToastStore from '@/store/toastStore';
import Toast from './Toast';

const ToastContainer = () => {
  const { message, variant, hideToast } = useToastStore();

  return message ? (
    <Toast message={message} onClose={hideToast} variant={variant} />
  ) : null;
};

export default ToastContainer;
