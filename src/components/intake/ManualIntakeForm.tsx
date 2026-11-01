import React, { useState } from 'react';
import type { OccasionType } from '../../types';

interface ManualIntakeFormProps {
  initialValues?: {
    title: string;
    occasion: OccasionType;
    eventDate: string;
    location: string;
    guestCount: number;
    totalBudgetMinor: number;
    currency: string;
  };
  onSubmit: (values: {
    title: string;
    occasion: OccasionType;
    eventDate: string;
    location: string;
    guestCount: number;
    totalBudgetMinor: number;
    currency: string;
  }) => void;
  onCancel?: () => void;
}

export const ManualIntakeForm: React.FC<ManualIntakeFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialValues?.title ?? 'My Celebration');
  const [occasion, setOccasion] = useState<OccasionType>(initialValues?.occasion ?? 'birthday');
  const [eventDate, setEventDate] = useState(initialValues?.eventDate ?? '2026-12-15');
  const [location, setLocation] = useState(initialValues?.location ?? 'Bengaluru');
  const [guestCount, setGuestCount] = useState(initialValues?.guestCount ?? 40);
  const [budgetStandard, setBudgetStandard] = useState(
    initialValues ? Math.floor(initialValues.totalBudgetMinor / 100) : 60000
  );
  const [currency, setCurrency] = useState(initialValues?.currency ?? 'INR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      occasion,
      eventDate,
      location,
      guestCount: Math.max(1, Number(guestCount)),
      totalBudgetMinor: Math.max(100, Math.floor(Number(budgetStandard) * 100)),
      currency,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="manual-plan-title"
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1"
          >
            Celebration Title
          </label>
          <input
            id="manual-plan-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 shadow-sm focus:border-mehfil-500 focus:ring-2 focus:ring-mehfil-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label
            htmlFor="manual-plan-occasion"
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1"
          >
            Occasion Type
          </label>
          <select
            id="manual-plan-occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value as OccasionType)}
            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 shadow-sm focus:border-mehfil-500 focus:ring-2 focus:ring-mehfil-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          >
            <option value="wedding">Wedding (Traditional & Modern)</option>
            <option value="birthday">Birthday Party</option>
            <option value="community">Community Event / Festival</option>
            <option value="milestone">Milestone / Anniversary</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="manual-plan-date"
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1"
          >
            Target Event Date
          </label>
          <input
            id="manual-plan-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 shadow-sm focus:border-mehfil-500 focus:ring-2 focus:ring-mehfil-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            required
          />
        </div>

        <div>
          <label
            htmlFor="manual-plan-location"
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1"
          >
            City / Location
          </label>
          <input
            id="manual-plan-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 shadow-sm focus:border-mehfil-500 focus:ring-2 focus:ring-mehfil-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            required
            maxLength={60}
          />
        </div>

        <div>
          <label
            htmlFor="manual-plan-guests"
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1"
          >
            Expected Guests
          </label>
          <input
            id="manual-plan-guests"
            type="number"
            min={1}
            max={5000}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 shadow-sm focus:border-mehfil-500 focus:ring-2 focus:ring-mehfil-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            required
          />
        </div>

        <div>
          <label
            htmlFor="manual-plan-budget"
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1"
          >
            Total Budget ({currency})
          </label>
          <div className="flex gap-2">
            <input
              id="manual-plan-budget"
              type="number"
              min={100}
              step={100}
              value={budgetStandard}
              onChange={(e) => setBudgetStandard(Number(e.target.value))}
              className="flex-1 rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 shadow-sm focus:border-mehfil-500 focus:ring-2 focus:ring-mehfil-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              required
            />
            <select
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-24 rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="touch-target px-4 py-2 rounded-xl text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="touch-target px-5 py-2.5 rounded-xl font-medium text-white bg-mehfil-600 hover:bg-mehfil-700 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-mehfil-500"
        >
          {initialValues ? 'Save Changes' : 'Initialize Plan'}
        </button>
      </div>
    </form>
  );
};
