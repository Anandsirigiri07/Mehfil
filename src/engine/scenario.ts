/**
 * Mehfil - Scenario Comparison Engine
 * Clones plans, simulates alternative options (Scenario B), and computes deterministic diffs.
 */

import type { MehfilPlan } from '../types';
import { calculateBudgetSplit } from './budget';
import { calculateTimeline } from './timeline';

export interface CategoryDiff {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly planAMinor: number;
  readonly planBMinor: number;
  readonly diffMinor: number; // Plan B - Plan A
}

export interface ScenarioDiffResult {
  readonly totalBudgetDeltaMinor: number;
  readonly guestCountDelta: number;
  readonly perGuestCostDeltaMinor: number;
  readonly eventDateDiffDays: number;
  readonly categoryDiffs: readonly CategoryDiff[];
  readonly timelineMilestoneDiffs: readonly {
    readonly taskId: string;
    readonly title: string;
    readonly dateA: string;
    readonly dateB: string;
  }[];
  readonly riskAnalysis: readonly string[];
}

/**
 * Clones a plan and applies scenario modifications (e.g. different guest count, budget, or date).
 */
export function cloneScenario(
  basePlan: MehfilPlan,
  overrides: {
    title?: string;
    guestCount?: number;
    totalBudgetMinor?: number;
    eventDate?: string;
    location?: string;
  }
): MehfilPlan {
  const newGuestCount = overrides.guestCount ?? basePlan.guestCount;
  const newTotalBudget = overrides.totalBudgetMinor ?? basePlan.budget.totalMinor;
  const newEventDate = overrides.eventDate ?? basePlan.eventDate;
  const newLocation = overrides.location ?? basePlan.location;

  // Re-run budget engine with new total
  const split = calculateBudgetSplit(
    newTotalBudget,
    basePlan.budget.contingencyPercent,
    basePlan.budget.categories
  );

  // Re-run timeline engine with new eventDate
  const updatedTimeline = calculateTimeline(basePlan.timeline, newEventDate);

  return {
    ...basePlan,
    id: `${basePlan.id}-scenario-b`,
    title: overrides.title ?? `${basePlan.title} (Scenario B)`,
    guestCount: newGuestCount,
    location: newLocation,
    eventDate: newEventDate,
    budget: {
      ...basePlan.budget,
      totalMinor: newTotalBudget,
      contingencyMinor: split.contingencyMinor,
      categories: split.categories,
    },
    timeline: updatedTimeline,
    updatedAt: basePlan.updatedAt,
  };
}

/**
 * Computes side-by-side diff between Scenario A and Scenario B.
 */
export function compareScenarios(planA: MehfilPlan, planB: MehfilPlan): ScenarioDiffResult {
  const totalBudgetDeltaMinor = planB.budget.totalMinor - planA.budget.totalMinor;
  const guestCountDelta = planB.guestCount - planA.guestCount;

  const costPerGuestA =
    planA.guestCount > 0 ? Math.floor(planA.budget.totalMinor / planA.guestCount) : 0;
  const costPerGuestB =
    planB.guestCount > 0 ? Math.floor(planB.budget.totalMinor / planB.guestCount) : 0;
  const perGuestCostDeltaMinor = costPerGuestB - costPerGuestA;

  // Category comparison
  const catMapA = new Map(planA.budget.categories.map((c) => [c.id, c]));
  const catMapB = new Map(planB.budget.categories.map((c) => [c.id, c]));
  const allCatIds = Array.from(new Set([...catMapA.keys(), ...catMapB.keys()]));

  const categoryDiffs: CategoryDiff[] = allCatIds.map((id) => {
    const a = catMapA.get(id);
    const b = catMapB.get(id);
    const aMinor = a?.allocatedMinor ?? 0;
    const bMinor = b?.allocatedMinor ?? 0;
    return {
      categoryId: id,
      categoryName: a?.name ?? b?.name ?? id,
      planAMinor: aMinor,
      planBMinor: bMinor,
      diffMinor: bMinor - aMinor,
    };
  });

  // Timeline milestone differences
  const taskMapA = new Map(planA.timeline.map((t) => [t.id, t]));
  const timelineMilestoneDiffs = planB.timeline
    .filter((tB) => tB.isMilestone)
    .map((tB) => {
      const tA = taskMapA.get(tB.id);
      return {
        taskId: tB.id,
        title: tB.title,
        dateA: tA?.calculatedDate ?? 'N/A',
        dateB: tB.calculatedDate,
      };
    })
    .filter((m) => m.dateA !== m.dateB);

  // Qualitative risks derived from mathematical diffs
  const riskAnalysis: string[] = [];
  if (guestCountDelta < 0) {
    riskAnalysis.push(
      `Downsized guest count by ${Math.abs(guestCountDelta)} reduces catering and space constraints.`
    );
  } else if (guestCountDelta > 0) {
    riskAnalysis.push(
      `Added ${guestCountDelta} guests. Ensure venue maximum occupancy is not exceeded.`
    );
  }

  if (totalBudgetDeltaMinor < 0) {
    riskAnalysis.push(
      `Reduced budget by ${Math.abs(totalBudgetDeltaMinor)} minor units requires trimming luxury items.`
    );
  } else if (totalBudgetDeltaMinor > 0) {
    riskAnalysis.push(
      `Expanded budget by ${totalBudgetDeltaMinor} minor units offers buffer for premier vendors.`
    );
  }

  return {
    totalBudgetDeltaMinor,
    guestCountDelta,
    perGuestCostDeltaMinor,
    eventDateDiffDays: 0,
    categoryDiffs,
    timelineMilestoneDiffs,
    riskAnalysis,
  };
}
