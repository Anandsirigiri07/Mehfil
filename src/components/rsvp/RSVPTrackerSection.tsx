import React, { useState } from 'react';
import { Users, Utensils, Plus, Trash2, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import type { DietaryRequirement, GuestRSVP, RSVPStatus } from '../../types';
import { calculateRSVPSummary } from '../../engine/rsvp';

interface RSVPTrackerSectionProps {
  rsvps: readonly GuestRSVP[];
  onAddGuest: (guest: GuestRSVP) => void;
  onUpdateGuest: (guest: GuestRSVP) => void;
  onRemoveGuest: (guestId: string) => void;
}

export const RSVPTrackerSection: React.FC<RSVPTrackerSectionProps> = ({
  rsvps,
  onAddGuest,
  onUpdateGuest,
  onRemoveGuest,
}) => {
  const summary = calculateRSVPSummary(rsvps);
  const [newGuestName, setNewGuestName] = useState('');
  const [newPlusOnes, setNewPlusOnes] = useState(0);
  const [newDietary, setNewDietary] = useState<DietaryRequirement[]>(['veg']);
  const [newStatus, setNewStatus] = useState<RSVPStatus>('yes');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    onAddGuest({
      id: `guest-${Date.now()}`,
      name: newGuestName.trim(),
      status: newStatus,
      dietary: newDietary,
      plusOnes: Math.max(0, newPlusOnes),
    });

    setNewGuestName('');
    setNewPlusOnes(0);
    setNewDietary(['veg']);
  };

  const toggleDietaryRequirement = (diet: DietaryRequirement) => {
    setNewDietary((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  return (
    <section aria-labelledby="rsvp-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="rsvp-heading" className="text-xl font-bold text-stone-900 dark:text-stone-100">
            RSVP & Catering Dietary Engine
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Calculates exact catering requirements: confirmed headcount + 50% tentative buffer.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
          <Utensils className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
          <span>Estimated Headcount: {summary.estimatedHeadcount} pax</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase">
            <Users className="w-4 h-4 text-stone-600 dark:text-stone-300" aria-hidden="true" />
            <span>Total Invited</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {summary.totalInvited}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Confirmed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
            {summary.confirmedGuests}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase">
            <HelpCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <span>Tentative</span>
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
            {summary.tentativeGuests}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm">
          <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 text-xs font-semibold uppercase">
            <XCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />
            <span>Declined</span>
          </div>
          <div className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-1">
            {summary.declinedGuests}
          </div>
        </div>
      </div>

      {/* Catering Portions Split Breakdown */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
          <span>Dietary Portions for Caterer</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <span className="text-stone-500 dark:text-stone-400 block">Vegetarian:</span>
            <span className="text-base font-bold text-stone-900 dark:text-stone-100">
              {summary.dietaryCounts.veg} meals
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <span className="text-stone-500 dark:text-stone-400 block">Vegan:</span>
            <span className="text-base font-bold text-stone-900 dark:text-stone-100">
              {summary.dietaryCounts.vegan} meals
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <span className="text-stone-500 dark:text-stone-400 block">Jain (No Root Veg):</span>
            <span className="text-base font-bold text-stone-900 dark:text-stone-100">
              {summary.dietaryCounts.jain} meals
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
            <span className="text-rose-700 dark:text-rose-300 block font-semibold">
              Allergies (Nut/Gluten):
            </span>
            <span className="text-base font-bold text-rose-900 dark:text-rose-100">
              {summary.specialAllergyCount} tagged
            </span>
          </div>
        </div>
      </div>

      {/* Add Guest Form */}
      <form
        onSubmit={handleAddSubmit}
        className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-3"
      >
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          Add Guest or Family Group
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="guest-name"
              className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1"
            >
              Guest Name
            </label>
            <input
              id="guest-name"
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="e.g. Anand Sharma"
              className="w-full text-xs rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              required
            />
          </div>
          <div>
            <label
              htmlFor="guest-status"
              className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1"
            >
              RSVP Status
            </label>
            <select
              id="guest-status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as RSVPStatus)}
              className="w-full text-xs rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            >
              <option value="yes">Yes (Attending)</option>
              <option value="maybe">Maybe (Tentative)</option>
              <option value="no">No (Declined)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="guest-plus-ones"
              className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1"
            >
              Plus-Ones
            </label>
            <input
              id="guest-plus-ones"
              type="number"
              min={0}
              max={10}
              value={newPlusOnes}
              onChange={(e) => setNewPlusOnes(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
            Dietary Tags:
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              ['veg', 'vegan', 'jain', 'halal', 'nut_free', 'gluten_free'] as DietaryRequirement[]
            ).map((diet) => (
              <button
                key={diet}
                type="button"
                onClick={() => toggleDietaryRequirement(diet)}
                className={`touch-target px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${
                  newDietary.includes(diet)
                    ? 'border-mehfil-500 bg-mehfil-50 text-mehfil-900 dark:bg-mehfil-950 dark:text-mehfil-200'
                    : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="touch-target px-4 py-2 text-xs font-semibold rounded-lg bg-mehfil-600 hover:bg-mehfil-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Guest</span>
          </button>
        </div>
      </form>

      {/* Guest Table */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="p-3 font-semibold">Guest Name</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Headcount</th>
                <th className="p-3 font-semibold">Dietary</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {rsvps.map((guest) => (
                <tr key={guest.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                  <td className="p-3 font-medium text-stone-900 dark:text-stone-100">
                    {guest.name}
                  </td>
                  <td className="p-3">
                    <select
                      aria-label={`RSVP Status for ${guest.name}`}
                      value={guest.status}
                      onChange={(e) =>
                        onUpdateGuest({
                          ...guest,
                          status: e.target.value as RSVPStatus,
                        })
                      }
                      className="rounded border border-stone-300 bg-white p-1 text-xs dark:border-stone-700 dark:bg-stone-800"
                    >
                      <option value="yes">Yes</option>
                      <option value="maybe">Maybe</option>
                      <option value="no">No</option>
                    </select>
                  </td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">
                    {1 + guest.plusOnes} (1 + {guest.plusOnes})
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {guest.dietary.map((d) => (
                        <span
                          key={d}
                          className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-mono"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveGuest(guest.id)}
                      className="touch-target p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      aria-label={`Remove ${guest.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
