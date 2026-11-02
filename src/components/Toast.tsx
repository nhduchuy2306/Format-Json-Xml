import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const bgMap = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  const iconMap = {
    success: <CheckCircle2 size={16} className="shrink-0" />,
    error: <AlertTriangle size={16} className="shrink-0" />,
    info: <Info size={16} className="shrink-0" />,
  };

  return (
    <div className="fixed top-14 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-lg shadow-xl text-xs font-medium backdrop-blur-md animate-toast transition-all select-none">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md shadow-md ${bgMap[toast.type]}`}>
        {iconMap[toast.type]}
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-black/20 rounded p-0.5 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};

