import React from 'react';
import { ShieldAlert, Lightbulb, Info } from 'lucide-react';

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

interface ChatMessagesViewProps {
  chatLog: { q: string; a: string; fallback?: boolean }[];
}

export const ChatMessagesView: React.FC<ChatMessagesViewProps> = ({ chatLog }) => {
  return (
    <div className="space-y-3">
      {chatLog.length === 0 && (
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 text-center space-y-2">
          <Lightbulb className="w-6 h-6 text-amber-500 mx-auto" aria-hidden="true" />
          <p className="font-semibold">Ask anything grounded in your plan</p>
          <p className="text-[11px]">
            "What is our budget contingency?", "Which tasks are delayed?", or "How many vegan meals
            do we need?"
          </p>
        </div>
      )}
      {chatLog.map((msg, idx) => (
        <div key={idx} className="space-y-2">
          <div className="bg-stone-100 dark:bg-stone-800 p-2.5 rounded-xl ml-6 font-medium text-stone-900 dark:text-stone-100">
            {msg.q}
          </div>
          <div className="bg-mehfil-50 dark:bg-mehfil-950/40 border border-mehfil-200 dark:border-mehfil-900 p-2.5 rounded-xl mr-6 text-stone-800 dark:text-stone-200">
            {msg.fallback && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-1">
                <Info className="w-3 h-3" aria-hidden="true" /> Offline Rule Heuristic
              </span>
            )}
            <p className="whitespace-pre-line leading-relaxed">{msg.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
