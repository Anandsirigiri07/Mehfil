import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorSummaryProps {
  errors: readonly string[];
  onDismiss?: () => void;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors, onDismiss }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0) {
      containerRef.current?.focus();
    }
  }, [errors]);

  if (errors.length === 0) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="mb-6 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200 outline-none focus:ring-2 focus:ring-rose-500"
    >
      <div className="flex items-center gap-3 font-semibold text-base mb-2">
        <AlertCircle
          className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0"
          aria-hidden="true"
        />
        <h2 id="error-summary-title" className="text-base font-bold">
          There are {errors.length} issue{errors.length > 1 ? 's' : ''} to resolve
        </h2>
      </div>
      <ul className="list-disc list-inside space-y-1 text-sm pl-2">
        {errors.map((err, idx) => (
          <li key={idx}>{err}</li>
        ))}
      </ul>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-xs font-semibold underline hover:no-underline text-rose-700 dark:text-rose-300"
        >
          Dismiss notice
        </button>
      )}
    </div>
  );
};
