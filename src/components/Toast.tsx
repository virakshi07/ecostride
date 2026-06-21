import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  subMessage?: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  show,
  message,
  subMessage,
  onClose,
  duration = 3500
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-50 flex items-start space-x-3 border border-slate-800 animate-slide-up md:animate-slide-in">
      <div className="flex-shrink-0 text-emerald-400 mt-0.5">
        <CheckCircle className="h-6 w-6" />
      </div>
      <div className="flex-grow">
        <h4 className="text-sm font-semibold tracking-wide text-white">{message}</h4>
        {subMessage && (
          <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
            {subMessage}
          </p>
        )}
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors duration-150 p-0.5 hover:bg-slate-800 rounded-lg"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
export default Toast;
