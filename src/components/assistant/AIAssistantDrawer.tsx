import React, { useState, useRef } from 'react';
import { X, Sparkles, Send, ShieldAlert, Lightbulb, Loader2, Info } from 'lucide-react';
import type { MehfilPlan } from '../../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MehfilPlan;
  today: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  plan,
  today,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'ideas' | 'review'>('chat');
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<{ q: string; a: string; fallback?: boolean }[]>([]);
  const [ideas, setIdeas] = useState<{
    theme: string;
    ideas: { category: string; title: string; description: string; budgetTip: string }[];
    proTips: string[];
    isFallback?: boolean;
  } | null>(null);
  const [review, setReview] = useState<{
    overallHealthScore: number;
    summary: string;
    findings: {
      severity: string;
      area: string;
      message: string;
      actionableRecommendation: string;
    }[];
    isFallback?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const handleAskPlanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const currentQ = question.trim();
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, question: currentQ, today }),
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();
      setChatLog((prev) => [...prev, { q: currentQ, a: data.answer, fallback: data.isFallback }]);
    } catch (_err) {
      setChatLog((prev) => [
        ...prev,
        {
          q: currentQ,
          a: 'Connection error. Rule-based facts available in plan tabs.',
          fallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchIdeas = async () => {
    setIsLoading(true);
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/suggest-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: plan.occasion,
          guestCount: plan.guestCount,
          totalBudgetMinor: plan.budget.totalMinor,
          currency: plan.budget.currency,
          location: plan.location,
        }),
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();
      setIdeas(data);
    } catch (_err) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchReview = async () => {
    setIsLoading(true);
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/review-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, today }),
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();
      setReview(data);
    } catch (_err) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mehfil GenAI Planning Assistant"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-mehfil-600" aria-hidden="true" />
          <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
            Gemini Event Assistant
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="touch-target p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          aria-label="Close assistant drawer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b border-stone-200 dark:border-stone-800 text-xs font-semibold"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-mehfil-600 text-mehfil-600 dark:text-mehfil-400 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Ask Planner
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ideas'}
          onClick={() => {
            setActiveTab('ideas');
            if (!ideas) void handleFetchIdeas();
          }}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === 'ideas'
              ? 'border-mehfil-600 text-mehfil-600 dark:text-mehfil-400 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Personalized Ideas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'review'}
          onClick={() => {
            setActiveTab('review');
            if (!review) void handleFetchReview();
          }}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === 'review'
              ? 'border-mehfil-600 text-mehfil-600 dark:text-mehfil-400 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Review Plan
        </button>
      </div>

      {/* Tab Contents with Live Region */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs" aria-live="polite">
        {activeTab === 'chat' && (
          <div className="space-y-3">
            {chatLog.length === 0 && (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 text-center space-y-2">
                <Lightbulb className="w-6 h-6 text-amber-500 mx-auto" aria-hidden="true" />
                <p className="font-semibold">Ask anything grounded in your plan</p>
                <p className="text-[11px]">
                  "What is our budget contingency?", "Which tasks are delayed?", or "How many vegan
                  meals do we need?"
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
        )}

        {activeTab === 'ideas' && ideas && (
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
        )}

        {activeTab === 'review' && review && (
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
                <span className="font-bold uppercase tracking-wider text-[10px] block">
                  [{f.area}]
                </span>
                <p className="font-semibold">{f.message}</p>
                <p className="text-[11px] opacity-90">Action: {f.actionableRecommendation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Input */}
      {activeTab === 'chat' && (
        <form
          onSubmit={handleAskPlanner}
          className="p-3 border-t border-stone-200 dark:border-stone-800 flex gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask planner about this plan..."
            className="flex-1 text-xs rounded-xl border border-stone-300 bg-white p-2.5 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            disabled={isLoading}
            maxLength={250}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="touch-target px-3 rounded-xl bg-mehfil-600 hover:bg-mehfil-700 disabled:opacity-50 text-white transition-colors"
            aria-label="Send query to planner"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </form>
      )}
    </div>
  );
};
