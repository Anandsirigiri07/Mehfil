import React from 'react';
import { Sparkles, Share2, Copy, Edit3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import type { MehfilPlan } from '../../types';

interface HeaderProps {
  plan: MehfilPlan | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAssistant: () => void;
  onOpenScenario: () => void;
  onOpenExport: () => void;
  onEditIntake: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  plan,
  isDark,
  onToggleTheme,
  onOpenAssistant,
  onOpenScenario,
  onOpenExport,
  onEditIntake,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-mehfil-600 to-rose-400 text-white flex items-center justify-center font-black text-xl shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-stone-900 dark:text-stone-100">
                Mehfil
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-mehfil-100 text-mehfil-800 dark:bg-mehfil-950 dark:text-mehfil-300">
                Challenge 5
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
              GenAI Event Planning Assistant • Weddings, Birthdays & Community
            </p>
          </div>
        </div>

        {/* Plan Title & Actions */}
        <div className="flex items-center gap-2">
          {plan && (
            <>
              <button
                type="button"
                onClick={onEditIntake}
                className="touch-target px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors hidden md:flex items-center gap-1.5"
                title="Edit Plan Parameters"
              >
                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Edit Plan</span>
              </button>

              <button
                type="button"
                onClick={onOpenScenario}
                className="touch-target px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors hidden sm:flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Scenario B</span>
              </button>

              <button
                type="button"
                onClick={onOpenAssistant}
                className="touch-target px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-mehfil-600 hover:bg-mehfil-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" aria-hidden="true" />
                <span>Gemini AI</span>
              </button>

              <button
                type="button"
                onClick={onOpenExport}
                className="touch-target p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Export or share celebration plan"
                title="Export or Share"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
};
