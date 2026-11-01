import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface IdeasViewProps {
  ideas: {
    theme: string;
    ideas: { category: string; title: string; description: string; budgetTip: string }[];
  };
}

export const IdeasView: React.FC<IdeasViewProps> = ({ ideas }) => {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 font-bold text-sm text-stone-900 dark:text-stone-100">
        Theme: {ideas.theme}
      </div>
      {ideas.ideas.map((item, idx) => (
        <div
          key={idx}
          className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1"
        >
          <span className="font-semibold text-stone-900 dark:text-stone-100 block">
            {item.title}
          </span>
          <p className="text-stone-600 dark:text-stone-400">{item.description}</p>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium pt-1">
            💡 Tip: {item.budgetTip}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ReviewViewProps {
  review: {
    overallHealthScore: number;
    summary: string;
    findings: {
      severity: string;
      area: string;
      message: string;
      actionableRecommendation: string;
    }[];
  };
}

export const ReviewView: React.FC<ReviewViewProps> = ({ review }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase font-bold text-stone-500">
            Preparedness Health
          </span>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {review.overallHealthScore}/100
          </div>
        </div>
        <ShieldAlert className="w-8 h-8 text-mehfil-600" aria-hidden="true" />
      </div>
      <p className="text-stone-600 dark:text-stone-400 font-medium">{review.summary}</p>
      {review.findings.map((f, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-xl border text-xs space-y-1 ${
            f.severity === 'critical'
              ? 'border-rose-300 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20'
              : 'border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
          }`}
        >
          <span className="font-bold uppercase tracking-wider text-[10px] block">[{f.area}]</span>
          <p className="font-semibold">{f.message}</p>
          <p className="text-[11px] opacity-90">Action: {f.actionableRecommendation}</p>
        </div>
      ))}
    </div>
  );
};
