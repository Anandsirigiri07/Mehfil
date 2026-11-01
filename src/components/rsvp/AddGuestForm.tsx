import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { DietaryRequirement, GuestRSVP, RSVPStatus } from '../../types';

interface AddGuestFormProps {
  onAddGuest: (guest: GuestRSVP) => void;
}

const AVAILABLE_DIETS: DietaryRequirement[] = [
  'veg',
  'vegan',
  'jain',
  'halal',
  'nut_free',
  'gluten_free',
];

export const AddGuestForm: React.FC<AddGuestFormProps> = ({ onAddGuest }) => {
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
          {AVAILABLE_DIETS.map((diet) => (
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
  );
};
