import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export const ToastProvider: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const { type, message } = e.detail;
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 5000);
    };

    window.addEventListener('toast_notification', handleToast);
    return () => window.removeEventListener('toast_notification', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-orange-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgs = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] ${bgs[t.type]}`}
          >
            {icons[t.type]}
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const toast = (type: ToastType, message: string) => {
  window.dispatchEvent(new CustomEvent('toast_notification', { detail: { type, message } }));
};
