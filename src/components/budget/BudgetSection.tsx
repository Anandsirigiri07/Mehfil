import React from 'react';
import { Lock, Unlock, ShieldCheck, TrendingDown, DollarSign } from 'lucide-react';
import type { BudgetPlan, CategoryBudget } from '../../types';

interface BudgetSectionProps {
  budget: BudgetPlan;
  onToggleCategoryLock: (categoryId: string) => void;
  onUpdateContingency: (contingencyPercent: number) => void;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  budget,
  onToggleCategoryLock,
  onUpdateContingency,
}) => {
  const totalStandard = (budget.totalMinor / 100).toLocaleString('en-IN');
  const contingencyStandard = (budget.contingencyMinor / 100).toLocaleString('en-IN');
  const allocatedCategoriesSum = budget.categories.reduce((acc, c) => acc + c.allocatedMinor, 0);
  const totalSpentSum = budget.categories.reduce((acc, c) => acc + c.spentMinor, 0);
  const remainingMinor = budget.totalMinor - totalSpentSum;

  const priorityStyles: Record<CategoryBudget['priority'], { badge: string; label: string }> = {
    essential: {
      badge:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      label: 'Essential',
    },
    desired: {
      badge:
        'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800',
      label: 'Desired',
    },
    luxury: {
      badge:
        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      label: 'Luxury',
    },
  };

  return (
    <section aria-labelledby="budget-section-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            id="budget-section-heading"
            className="text-xl font-bold text-stone-900 dark:text-stone-100"
          >
            Deterministic Budget Allocation
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Computed in integer minor units with Hamilton-Hare largest-remainder rounding (Zero
            rounding loss).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="contingency-slider"
            className="text-sm font-semibold text-stone-700 dark:text-stone-300"
          >
            Contingency: {budget.contingencyPercent}%
          </label>
          <input
            id="contingency-slider"
            type="range"
            min={0}
            max={25}
            step={1}
            value={budget.contingencyPercent}
            onChange={(e) => onUpdateContingency(Number(e.target.value))}
            className="w-32 accent-mehfil-600 cursor-pointer"
            aria-valuemin={0}
            aria-valuemax={25}
            aria-valuenow={budget.contingencyPercent}
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
            <span>Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            ₹{totalStandard}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Exact sum: ₹
            {((allocatedCategoriesSum + budget.contingencyMinor) / 100).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Contingency Reserve</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            ₹{contingencyStandard}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {budget.contingencyPercent}% protected for unforeseen expenses
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <TrendingDown className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span>Unallocated / Remaining</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            ₹{(remainingMinor / 100).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Total spent to date: ₹{(totalSpentSum / 100).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budget.categories.map((cat) => {
          const catStandard = (cat.allocatedMinor / 100).toLocaleString('en-IN');
          const percentOfBudget =
            budget.totalMinor > 0
              ? ((cat.allocatedMinor / budget.totalMinor) * 100).toFixed(1)
              : '0';
          const style = priorityStyles[cat.priority];

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border transition-all ${
                cat.isLocked
                  ? 'border-amber-400/80 bg-amber-50/40 dark:border-amber-700/60 dark:bg-amber-950/20'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
              } shadow-sm`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base">
                    {cat.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}
                  >
                    {style.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleCategoryLock(cat.id)}
                  className="touch-target p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  aria-label={
                    cat.isLocked ? `Unlock ${cat.name} budget` : `Lock ${cat.name} budget`
                  }
                  title={cat.isLocked ? 'Locked category' : 'Unlocked category'}
                >
                  {cat.isLocked ? (
                    <Lock
                      className="w-4 h-4 text-amber-600 dark:text-amber-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <Unlock className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  ₹{catStandard}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {percentOfBudget}% of total
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden"
                role="progressbar"
                aria-valuenow={Number(percentOfBudget)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${cat.name} allocation share`}
              >
                <svg className="w-full h-2 block" aria-hidden="true">
                  <rect
                    x="0"
                    y="0"
                    width={`${Math.min(100, Math.max(0, Number(percentOfBudget)))}%`}
                    height="100%"
                    rx="4"
                    className="fill-mehfil-600 transition-all duration-300"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
