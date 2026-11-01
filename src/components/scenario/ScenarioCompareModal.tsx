import React, { useState } from 'react';
import { X, Copy, ArrowRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { MehfilPlan } from '../../types';
import { cloneScenario, compareScenarios } from '../../engine/scenario';

interface ScenarioCompareModalProps {
  currentPlan: MehfilPlan;
  onApplyScenario: (newPlan: MehfilPlan) => void;
  onClose: () => void;
}

export const ScenarioCompareModal: React.FC<ScenarioCompareModalProps> = ({
  currentPlan,
  onApplyScenario,
  onClose,
}) => {
  const [bGuestCount, setBGuestCount] = useState<number>(
    Math.max(10, Math.floor(currentPlan.guestCount * 0.75))
  );
  const [bBudgetStandard, setBBudgetStandard] = useState<number>(
    Math.floor((currentPlan.budget.totalMinor / 100) * 0.8)
  );
  const [bLocation, setBLocation] = useState<string>(currentPlan.location);

  const scenarioB = cloneScenario(currentPlan, {
    title: `${currentPlan.title} (Scenario B)`,
    guestCount: bGuestCount,
    totalBudgetMinor: bBudgetStandard * 100,
    location: bLocation,
  });

  const diff = compareScenarios(currentPlan, scenarioB);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scenario-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-6 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2
              id="scenario-modal-title"
              className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2"
            >
              <Copy className="w-5 h-5 text-mehfil-600" aria-hidden="true" />
              <span>Scenario Comparison & What-If Analysis</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Side-by-side deterministic differential comparison between Plan A and Scenario B.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target p-2 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            aria-label="Close scenario compare dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scenario B Controls */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label
              htmlFor="b-guests"
              className="block font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Scenario B Guests:
            </label>
            <input
              id="b-guests"
              type="number"
              min={5}
              value={bGuestCount}
              onChange={(e) => setBGuestCount(Number(e.target.value))}
              className="w-full rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-600 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="b-budget"
              className="block font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Scenario B Budget (₹):
            </label>
            <input
              id="b-budget"
              type="number"
              min={100}
              step={500}
              value={bBudgetStandard}
              onChange={(e) => setBBudgetStandard(Number(e.target.value))}
              className="w-full rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-600 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="b-location"
              className="block font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Scenario B Venue / Location:
            </label>
            <input
              id="b-location"
              type="text"
              value={bLocation}
              onChange={(e) => setBLocation(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-600 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        {/* Summary Deltas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <span className="text-xs text-stone-500 dark:text-stone-400 block font-semibold uppercase">
              Total Budget Delta
            </span>
            <div className="text-xl font-bold flex items-center justify-center gap-1 mt-1">
              {diff.totalBudgetDeltaMinor < 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <TrendingUp className="w-4 h-4 text-rose-600" aria-hidden="true" />
              )}
              <span>₹{(Math.abs(diff.totalBudgetDeltaMinor) / 100).toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[11px] text-stone-500">
              {diff.totalBudgetDeltaMinor < 0 ? 'Cost Savings' : 'Additional Expenditure'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <span className="text-xs text-stone-500 dark:text-stone-400 block font-semibold uppercase">
              Headcount Delta
            </span>
            <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              {diff.guestCountDelta > 0 ? `+${diff.guestCountDelta}` : diff.guestCountDelta} guests
            </div>
            <span className="text-[11px] text-stone-500">
              {currentPlan.guestCount} (Plan A) → {scenarioB.guestCount} (Scenario B)
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <span className="text-xs text-stone-500 dark:text-stone-400 block font-semibold uppercase">
              Per-Guest Cost
            </span>
            <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              ₹{(diff.perGuestCostDeltaMinor / 100).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-stone-500">Variance per attendee</span>
          </div>
        </div>

        {/* Category Side-by-Side Diff Table */}
        <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              <tr>
                <th className="p-2.5 font-semibold">Category</th>
                <th className="p-2.5 font-semibold">Plan A (Current)</th>
                <th className="p-2.5 font-semibold">Scenario B</th>
                <th className="p-2.5 font-semibold text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {diff.categoryDiffs.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <td className="p-2.5 font-medium">{cat.categoryName}</td>
                  <td className="p-2.5">₹{(cat.planAMinor / 100).toLocaleString('en-IN')}</td>
                  <td className="p-2.5">₹{(cat.planBMinor / 100).toLocaleString('en-IN')}</td>
                  <td
                    className={`p-2.5 text-right font-bold ${cat.diffMinor < 0 ? 'text-emerald-600' : cat.diffMinor > 0 ? 'text-rose-600' : 'text-stone-400'}`}
                  >
                    {cat.diffMinor < 0 ? '-' : cat.diffMinor > 0 ? '+' : ''}₹
                    {(Math.abs(cat.diffMinor) / 100).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk Analysis */}
        {diff.riskAnalysis.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>Simulated Impact & Operational Notes:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {diff.riskAnalysis.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="touch-target px-4 py-2 rounded-xl text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 font-medium transition-colors"
          >
            Keep Plan A
          </button>
          <button
            type="button"
            onClick={() => onApplyScenario(scenarioB)}
            className="touch-target px-5 py-2.5 rounded-xl font-medium text-white bg-mehfil-600 hover:bg-mehfil-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>Adopt Scenario B</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
