/**
 * Mehfil - Serverless Offline Rule-Based Advisor Fallbacks (Review & Chat)
 */

import type { MehfilPlan } from '../../src/types';

export function fallbackReviewPlan(
  plan: MehfilPlan,
  today: string
): {
  overallHealthScore: number;
  summary: string;
  findings: {
    severity: 'critical' | 'warning' | 'tip';
    area: string;
    message: string;
    actionableRecommendation: string;
  }[];
  isFallback: boolean;
} {
  const findings: {
    severity: 'critical' | 'warning' | 'tip';
    area: string;
    message: string;
    actionableRecommendation: string;
  }[] = [];

  const [y, m, d] = today.split('-').map(Number);
  const [ey, em, ed] = plan.eventDate.split('-').map(Number);
  const daysUntil = Math.round(
    (Date.UTC(ey ?? 2026, (em ?? 1) - 1, ed ?? 1) - Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1)) /
      (1000 * 60 * 60 * 24)
  );

  if (daysUntil < 14) {
    findings.push({
      severity: 'critical',
      area: 'Timeline',
      message: `Event date is only ${daysUntil} days away. High risk of vendor booking conflicts.`,
      actionableRecommendation: 'Immediately prioritize locking venue and catering contracts.',
    });
  } else if (daysUntil < 45 && plan.occasion === 'wedding') {
    findings.push({
      severity: 'warning',
      area: 'Timeline',
      message: 'Weddings typically need 60-90 days for bespoke invitations and attire fittings.',
      actionableRecommendation:
        'Send digital save-the-dates this week to confirm guest headcounts early.',
    });
  }

  if (plan.budget.contingencyPercent < 5) {
    findings.push({
      severity: 'warning',
      area: 'Budget',
      message:
        'Contingency reserve is under 5%. Unexpected costs may strain individual category budgets.',
      actionableRecommendation:
        'Set contingency to at least 10% to absorb last-minute taxes and overtime.',
    });
  }

  const unbookedVendors = plan.vendors.filter((v) => v.status === 'not_started');
  if (unbookedVendors.length > 2) {
    findings.push({
      severity: 'warning',
      area: 'Vendors',
      message: `${unbookedVendors.length} key vendor categories are still in "Not Started" status.`,
      actionableRecommendation:
        'Request quotes for pending categories to prevent rate escalations.',
    });
  }

  const overallHealthScore = Math.max(
    40,
    100 -
      findings.filter((f) => f.severity === 'critical').length * 25 -
      findings.filter((f) => f.severity === 'warning').length * 10
  );

  return {
    overallHealthScore,
    summary: `Plan evaluated with ${findings.length} actionable health checks. Overall score is ${overallHealthScore}/100.`,
    findings,
    isFallback: true,
  };
}

export function fallbackAskPlanner(
  plan: MehfilPlan,
  question: string
): {
  answer: string;
  referencedItems: string[];
  suggestedAction: string;
  isFallback: boolean;
} {
  const q = question.toLowerCase();
  const referenced: string[] = [];

  if (q.includes('budget') || q.includes('cost') || q.includes('money') || q.includes('spend')) {
    const total = (plan.budget.totalMinor / 100).toLocaleString('en-IN');
    const contingency = (plan.budget.contingencyMinor / 100).toLocaleString('en-IN');
    referenced.push('Budget Allocation', 'Contingency Reserve');
    return {
      answer: `Total event budget is ₹${total} (${plan.budget.currency}) with a ${plan.budget.contingencyPercent}% contingency reserve (₹${contingency}). All category splits use largest-remainder rounding.`,
      referencedItems: referenced,
      suggestedAction: 'Review category allocations in the Budget tab.',
      isFallback: true,
    };
  }

  if (q.includes('guest') || q.includes('rsvp') || q.includes('food') || q.includes('diet')) {
    referenced.push('Guest Count', 'RSVP Tracker');
    return {
      answer: `The event is planned for ${plan.guestCount} guests in ${plan.location}. The RSVP engine automatically calculates dietary portions for veg, vegan, jain, and allergies.`,
      referencedItems: referenced,
      suggestedAction: 'Check confirmed dietary headcounts in the RSVP tab.',
      isFallback: true,
    };
  }

  return {
    answer: `Facts for "${plan.title}": ${plan.occasion} on ${plan.eventDate} in ${plan.location} with ${plan.guestCount} guests and budget ₹${(plan.budget.totalMinor / 100).toLocaleString('en-IN')}.`,
    referencedItems: ['Overview', 'Event Facts'],
    suggestedAction: 'Ask about budget splits, timeline tasks, or dietary requirements.',
    isFallback: true,
  };
}
