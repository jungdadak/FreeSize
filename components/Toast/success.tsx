import React, { useEffect, useState } from 'react';

interface SuccessToastProps {
  message?: string;
  duration?: number;
  onClose?: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({
  message = '회원가입이 완료되었습니다!',
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

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
        setTimeout(() => setVisible(false), 200);
        onClose?.();
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 right-0 z-50 animate-slide-in">
      <div className="relative bg-green-500 text-white px-8 py-4 rounded-none min-w-[500px] h-16 flex items-center border-b border-l border-green-600/50">
        <div className="flex items-center gap-3">
          {/* Check mark icon */}
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

        {/* Progress bar - with dark mode support */}
        <div className="absolute bottom-0 right-0 left-0 h-1 bg-green-600/30">
          <div
            className="h-full bg-green-700 dark:bg-[#1e1e1e] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Add required keyframes to your global CSS or Tailwind config
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default SuccessToast;
