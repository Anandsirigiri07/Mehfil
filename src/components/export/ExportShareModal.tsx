import React, { useState } from 'react';
import { X, Calendar, Printer, Share2, Copy, Check } from 'lucide-react';
import type { MehfilPlan } from '../../types';
import { generateICalendar, encodeShareablePlan } from '../../engine/export';

interface ExportShareModalProps {
  plan: MehfilPlan;
  onClose: () => void;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({ plan, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleDownloadICS = () => {
    const icsContent = generateICalendar(plan);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${plan.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    try {
      const encoded = encodeShareablePlan(plan);
      const shareUrl = `${window.location.origin}${window.location.pathname}#plan=${encoded}`;
      void navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Plan payload exceeded size limit.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2
            id="export-modal-title"
            className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2"
          >
            <Share2 className="w-5 h-5 text-mehfil-600" aria-hidden="true" />
            <span>Export & Share Celebration</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Calendar Download */}
          <button
            type="button"
            onClick={handleDownloadICS}
            className="w-full p-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-mehfil-500 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <Calendar
                className="w-5 h-5 text-mehfil-600 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <div>
                <span className="font-bold text-sm text-stone-900 dark:text-stone-100 block">
                  Download .ics Calendar
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Import milestones into Google Calendar, Apple Calendar, or Outlook
                </span>
              </div>
            </div>
          </button>

          {/* Printable Run-Sheet */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full p-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-mehfil-500 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <Printer
                className="w-5 h-5 text-mehfil-600 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <div>
                <span className="font-bold text-sm text-stone-900 dark:text-stone-100 block">
                  Print Master Run-Sheet
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Clean, printer-formatted summary of timelines, contacts, and budget
                </span>
              </div>
            </div>
          </button>

          {/* Shareable Link */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                Validated Shareable URL
              </span>
              <span className="text-[10px] text-stone-500">Size capped (&lt; 32 KB)</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full touch-target px-4 py-2.5 rounded-xl font-medium text-xs text-white bg-mehfil-600 hover:bg-mehfil-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                  <span>Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copy Shareable URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
