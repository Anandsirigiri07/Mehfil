import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  text: string;
}

interface ToastContainerProps {
  toasts: readonly ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success' ? CheckCircle2 : toast.type === 'warning' ? AlertTriangle : Info;

        const borderBg =
          toast.type === 'success'
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
            : toast.type === 'warning'
              ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200'
              : 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all ${borderBg}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 text-sm font-medium">
              <span className="sr-only">[{toast.type.toUpperCase()}] </span>
              {toast.text}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="touch-target p-1 rounded-md text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
              aria-label={`Close ${toast.type} notification`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
