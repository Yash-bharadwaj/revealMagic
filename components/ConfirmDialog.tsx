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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-black border border-zinc-800 w-full max-w-[500px] rounded-2xl p-10 shadow-2xl scale-in-center animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">{title}</h2>
        <p className="text-sm text-zinc-400 mb-10 whitespace-pre-line">{message}</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full h-12 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
              variant === 'danger' 
                ? 'bg-rose-600 hover:bg-rose-700 text-white disabled:bg-rose-800 disabled:opacity-70' 
                : 'bg-white hover:bg-zinc-200 text-black disabled:bg-zinc-300 disabled:opacity-70'
            } disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="w-full h-12 bg-transparent text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
