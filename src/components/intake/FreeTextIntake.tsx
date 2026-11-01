import React, { useState } from 'react';
import { Sparkles, Loader2, Info } from 'lucide-react';
import type { OccasionType } from '../../types';
import { fallbackParseIntake } from '../../engine';

interface FreeTextIntakeProps {
  today: string;
  onParsed: (result: {
    title: string;
    occasion: OccasionType;
    eventDate: string;
    location: string;
    guestCount: number;
    totalBudgetMinor: number;
    currency: string;
    isFallback?: boolean;
  }) => void;
  onError: (msg: string) => void;
}

const SAMPLE_PROMPTS = [
  'Birthday for 40 kids in Bengaluru, 60k budget, next month',
  'Traditional wedding for 180 guests in Jaipur, 12 lakh budget, in 4 months',
  'Community cultural fest for 250 residents in Hyderabad, 80k budget, in 30 days',
  'Silver wedding anniversary celebration for 50 guests in Pune, 2 lakh budget',
];

export const FreeTextIntake: React.FC<FreeTextIntakeProps> = ({ today, onParsed, onError }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFallback, setLastFallback] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      onError('Please enter a descriptive prompt with at least 5 characters.');
      return;
    }

    setIsLoading(true);
    setLastFallback(false);

    try {
      const response = await fetch('/api/parse-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, today }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.isFallback) {
        setLastFallback(true);
      }
      onParsed(data);
    } catch {
      // Deterministic offline fallback: when API fails or network drops, parse locally
      const fallbackData = fallbackParseIntake(description, today);
      setLastFallback(true);
      onParsed(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="event-description-input"
          className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1"
        >
          Describe your celebration in natural language
        </label>
        <div className="relative">
          <textarea
            id="event-description-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Birthday for 40 kids in Bengaluru, 60k budget, next month"
            className="w-full rounded-xl border border-stone-300 bg-white p-3.5 text-stone-900 shadow-sm transition placeholder:text-stone-400 focus:border-mehfil-500 focus:ring-2 focus:ring-mehfil-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
            disabled={isLoading}
            required
            minLength={5}
            maxLength={1000}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Try a sample prompt:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setDescription(prompt)}
              className="touch-target px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {lastFallback && (
        <div
          role="status"
          className="flex items-center gap-2 p-3 text-xs rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
        >
          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Rule-based fallback parser active (offline or API key unconfigured).</span>
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isLoading || description.trim().length < 5}
          className="touch-target px-5 py-2.5 rounded-xl font-medium text-white bg-mehfil-600 hover:bg-mehfil-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm focus-visible:ring-2 focus-visible:ring-mehfil-500"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Analyzing with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Generate Event Plan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
