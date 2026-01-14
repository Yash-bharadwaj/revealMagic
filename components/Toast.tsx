import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' 
    ? 'bg-green-600' 
    : type === 'error' 
    ? 'bg-rose-600' 
    : 'bg-zinc-800';

  return (
    <div className="fixed bottom-6 right-6 z-[400] animate-in slide-in-from-right duration-300" style={{ zIndex: 9999 }}>
      <div className={`${bgColor} border border-zinc-800 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md`}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium pr-2">{message}</p>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
