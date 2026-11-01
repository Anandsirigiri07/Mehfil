import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, ShieldCheck, Heart } from 'lucide-react';
import { FreeTextIntake } from './FreeTextIntake';
import { ManualIntakeForm } from './ManualIntakeForm';
import type { OccasionType } from '../../types';

interface IntakeHeroProps {
  today: string;
  onPlanCreated: (params: {
    title: string;
    occasion: OccasionType;
    eventDate: string;
    location: string;
    guestCount: number;
    totalBudgetMinor: number;
    currency: string;
  }) => void;
  onError: (msg: string) => void;
}

export const IntakeHero: React.FC<IntakeHeroProps> = ({ today, onPlanCreated, onError }) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Hero Headline */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
          <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" aria-hidden="true" />
          <span>PromptWars Challenge 5 • Celebration & Event Planner</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 dark:text-stone-50">
          Welcome to <span className="text-mehfil-600 dark:text-mehfil-400">Mehfil</span>
        </h1>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
          AI understands your natural celebration vision. A deterministic engine manages the
          budgets, timelines, dietary headcounts, and vendor cashflows.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-stone-200 dark:bg-stone-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`touch-target px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'ai'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-mehfil-600" aria-hidden="true" />
            <span>GenAI Natural Intake</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`touch-target px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'manual'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Manual Form</span>
          </button>
        </div>
      </div>

      {/* Intake Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
        {mode === 'ai' ? (
          <FreeTextIntake today={today} onParsed={onPlanCreated} onError={onError} />
        ) : (
          <ManualIntakeForm onSubmit={onPlanCreated} />
        )}
      </div>

      {/* Guarantee Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-stone-600 dark:text-stone-400">
        <div className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold text-stone-900 dark:text-stone-200 block">
              Exact Integer Rounding
            </span>
            <span>Hamilton-Hare largest-remainder algorithm guarantees zero penny loss.</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-mehfil-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold text-stone-900 dark:text-stone-200 block">
              Strictly Grounded AI
            </span>
            <span>Gemini operates server-side only; never hallucinates prices or math.</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 flex items-start gap-3">
          <SlidersHorizontal className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold text-stone-900 dark:text-stone-200 block">
              Scenario B Simulation
            </span>
            <span>Side-by-side diffing of guest downsizing, budget cuts, and schedule risks.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
