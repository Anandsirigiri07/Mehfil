/**
 * Mehfil - Deterministic Budget Engine
 * Pure TypeScript, zero clock dependency, all calculations in integer minor units (paise/cents).
 * Guarantees exact sum equality using the largest-remainder method (Hamilton-Hare).
 */

import type { CategoryBudget, OccasionType, PriorityLevel } from '../types';

export interface BaseCategoryTemplate {
  readonly id: string;
  readonly name: string;
  readonly defaultWeight: number; // percentage
  readonly priority: PriorityLevel;
}

export const DEFAULT_CATEGORY_TEMPLATES: Record<OccasionType, readonly BaseCategoryTemplate[]> = {
  wedding: [
    { id: 'venue', name: 'Venue & Staging', defaultWeight: 30, priority: 'essential' },
    { id: 'catering', name: 'Catering & Dining', defaultWeight: 25, priority: 'essential' },
    { id: 'decor', name: 'Decor & Florals', defaultWeight: 15, priority: 'desired' },
    { id: 'photography', name: 'Photography & Film', defaultWeight: 12, priority: 'desired' },
    { id: 'attire', name: 'Attire & Styling', defaultWeight: 8, priority: 'desired' },
    { id: 'entertainment', name: 'Music & Entertainment', defaultWeight: 6, priority: 'luxury' },
    { id: 'invitations', name: 'Invites & Favors', defaultWeight: 4, priority: 'luxury' },
  ],
  birthday: [
    { id: 'venue', name: 'Venue Rental', defaultWeight: 25, priority: 'essential' },
    { id: 'catering', name: 'Cake & Food', defaultWeight: 35, priority: 'essential' },
    { id: 'decor', name: 'Theme & Balloons', defaultWeight: 15, priority: 'desired' },
    { id: 'entertainment', name: 'Games & Magic/DJ', defaultWeight: 15, priority: 'desired' },
    { id: 'favors', name: 'Return Gifts & Favors', defaultWeight: 10, priority: 'luxury' },
  ],
  community: [
    { id: 'venue', name: 'Public Ground / Hall', defaultWeight: 25, priority: 'essential' },
    { id: 'permits', name: 'Permits & Police Clearance', defaultWeight: 10, priority: 'essential' },
    { id: 'equipment', name: 'Sound & Stage Setup', defaultWeight: 25, priority: 'essential' },
    { id: 'refreshments', name: 'Community Meals/Drinks', defaultWeight: 20, priority: 'desired' },
    { id: 'marketing', name: 'Banners & Outreach', defaultWeight: 10, priority: 'desired' },
    { id: 'safety', name: 'Sanitation & First Aid', defaultWeight: 10, priority: 'essential' },
  ],
  milestone: [
    { id: 'venue', name: 'Private Dining / Hall', defaultWeight: 35, priority: 'essential' },
    { id: 'catering', name: 'Curated Feast & Toast', defaultWeight: 30, priority: 'essential' },
    { id: 'photography', name: 'Portraits & Video', defaultWeight: 15, priority: 'desired' },
    { id: 'decor', name: 'Floral Arrangements', defaultWeight: 12, priority: 'desired' },
    { id: 'mementos', name: 'Keepsakes & Program', defaultWeight: 8, priority: 'luxury' },
  ],
};

/**
 * Distributes an integer amount among items using the Largest Remainder Method (Hamilton-Hare).
 * Ensures sum(allocated) === totalToDistribute exactly with no rounding loss.
 */
export function distributeIntegerLargestRemainder(
  totalToDistribute: number,
  weights: readonly number[]
): number[] {
  if (totalToDistribute <= 0 || weights.length === 0) {
    return weights.map(() => 0);
  }

  const weightSum = weights.reduce((acc, w) => acc + Math.max(0, w), 0);
  if (weightSum <= 0) {
    // If all weights are 0, divide evenly
    const even = Math.floor(totalToDistribute / weights.length);
    const remainder = totalToDistribute - even * weights.length;
    return weights.map((_, idx) => even + (idx < remainder ? 1 : 0));
  }

  const exactShares = weights.map((w) => (Math.max(0, w) * totalToDistribute) / weightSum);
  const floors = exactShares.map((s) => Math.floor(s));
  const allocatedSum = floors.reduce((acc, f) => acc + f, 0);
  const remainder = totalToDistribute - allocatedSum;

  const indexedRemainders = exactShares
    .map((share, idx) => ({
      idx,
      fractional: share - (floors[idx] ?? 0),
    }))
    .sort((a, b) => b.fractional - a.fractional);

  const result = [...floors];
  for (let i = 0; i < remainder; i++) {
    const item = indexedRemainders[i % indexedRemainders.length];
    if (item !== undefined) {
      result[item.idx] = (result[item.idx] ?? 0) + 1;
    }
  }

  return result;
}

/**
 * Calculates budget split for all categories given a total budget, contingency percentage,
 * and optional locked categories.
 */
export function calculateBudgetSplit(
  totalMinor: number,
  contingencyPercent: number,
  categories: readonly CategoryBudget[]
): {
  contingencyMinor: number;
  availableMinor: number;
  categories: CategoryBudget[];
} {
  const safeTotal = Math.max(0, Math.floor(totalMinor));
  const safeContingencyPct = Math.min(30, Math.max(0, contingencyPercent));

  // Compute contingency reserve in integer minor units
  const contingencyMinor = Math.floor((safeTotal * safeContingencyPct) / 100);
  const availableForCategories = safeTotal - contingencyMinor;

  // Separate locked and unlocked categories
  let lockedSum = 0;
  for (const cat of categories) {
    if (cat.isLocked) {
      lockedSum += cat.allocatedMinor;
    }
  }

  // Handle case where locked amount exceeds available budget
  const remainingToDistribute = Math.max(0, availableForCategories - lockedSum);
  const unlockedCategories = categories.filter((c) => !c.isLocked);

  // Compute dynamic weights based on priority
  // Essential gets 1.5x factor, Desired 1.0x, Luxury 0.7x
  const priorityMultipliers: Record<PriorityLevel, number> = {
    essential: 1.5,
    desired: 1.0,
    luxury: 0.7,
  };

  const unlockedWeights = unlockedCategories.map((c) => {
    const multiplier = priorityMultipliers[c.priority] ?? 1.0;
    return c.baseWeight * multiplier;
  });

  const distributed = distributeIntegerLargestRemainder(remainingToDistribute, unlockedWeights);

  let unlockedIdx = 0;
  const updatedCategories: CategoryBudget[] = categories.map((cat) => {
    if (cat.isLocked) {
      return cat;
    }
    const newlyAllocated = distributed[unlockedIdx] ?? 0;
    unlockedIdx++;
    return {
      ...cat,
      allocatedMinor: newlyAllocated,
    };
  });

  return {
    contingencyMinor,
    availableMinor: availableForCategories,
    categories: updatedCategories,
  };
}

/**
 * Generates initial CategoryBudgets from occasion templates and initial budget amount.
 */
export function initializeBudgetCategories(
  occasion: OccasionType,
  totalMinor: number,
  contingencyPercent: number = 10
): {
  contingencyMinor: number;
  categories: CategoryBudget[];
} {
  const templates = DEFAULT_CATEGORY_TEMPLATES[occasion];
  const initialCategories: CategoryBudget[] = templates.map((tmpl) => ({
    id: tmpl.id,
    name: tmpl.name,
    baseWeight: tmpl.defaultWeight,
    allocatedMinor: 0,
    spentMinor: 0,
    isLocked: false,
    priority: tmpl.priority,
  }));

  const split = calculateBudgetSplit(totalMinor, contingencyPercent, initialCategories);
  return {
    contingencyMinor: split.contingencyMinor,
    categories: split.categories,
  };
}
