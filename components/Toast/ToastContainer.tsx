// components/ToastContainer.tsx
'use client';
import useToastStore from '@/store/toastStore';
import SuccessToast from '@/components/Toast/success';

const ToastContainer = () => {
  const { message, hideToast } = useToastStore();

  return message ? (
    <SuccessToast message={message} onClose={hideToast} />
  ) : null;
};

export default ToastContainer;
