import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div className="bg-black border border-zinc-800 w-full max-w-[500px] rounded-xl sm:rounded-2xl p-6 sm:p-10 shadow-2xl my-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{title}</h2>
        <p className="text-sm text-zinc-400 mb-8 whitespace-pre-line">{message}</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full h-11 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              variant === 'danger' 
                ? 'bg-rose-600 hover:bg-rose-700 text-white disabled:bg-rose-800 disabled:opacity-70' 
                : 'bg-white hover:bg-zinc-200 text-black disabled:bg-zinc-300 disabled:opacity-70'
            } disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
                  variant === 'danger' ? 'border-white/30 border-t-white' : 'border-black/30 border-t-black'
                }`}></div>
                <span>Deleting...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="w-full h-11 bg-transparent text-zinc-500 hover:text-white text-sm font-medium transition-all border border-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
