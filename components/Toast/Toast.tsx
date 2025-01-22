// components/Toast/Toast.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message?: string;
  duration?: number;
  onClose?: () => void;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

const getVariantStyles = (variant: ToastProps['variant'] = 'success') => {
  switch (variant) {
    case 'error':
      return {
        bg: 'bg-red-500',
        border: 'border-red-600/50',
        progress: 'bg-red-700',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-500',
        border: 'border-yellow-600/50',
        progress: 'bg-yellow-700',
      };
    case 'info':
      return {
        bg: 'bg-blue-500',
        border: 'border-blue-600/50',
        progress: 'bg-blue-700',
      };
    default:
      return {
        bg: 'bg-green-500',
        border: 'border-green-600/50',
        progress: 'bg-green-700',
      };
  }
};

const Toast: React.FC<ToastProps> = ({
  message = '알림',
  duration = 3000,
  onClose,
  variant = 'success',
}) => {
  const [visible, setVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [progress, setProgress] = useState(100);
  const styles = getVariantStyles(variant);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / duration) * 100;

      if (remaining > 0) {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      } else {
        setProgress(0);
        setVisible(false);
        setTimeout(() => {
          setShouldRender(false);
          onClose?.();
        }, 300);
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed top-16 right-0 z-50 ${
        visible ? 'animate-slide-in' : 'animate-fade-out'
      }`}
    >
      <div
        className={`relative ${styles.bg} text-white px-8 py-4 rounded-none min-w-[500px] h-16 flex items-center border-b border-l ${styles.border}`}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-base font-medium">{message}</p>
        </div>

        <div className="absolute bottom-0 right-0 left-0 h-1 bg-black/10">
          <div
            className={`h-full ${styles.progress} dark:bg-[#1e1e1e] transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
