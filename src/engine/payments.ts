/**
 * Mehfil - Vendor Payment & Cash Flow Engine
 * Tracks quotes, advances paid, balance due, and payment milestone dates.
 */

import type { TimelineTask, VendorPayment } from '../types';

export interface PaymentSummary {
  readonly totalQuotedMinor: number;
  readonly totalAdvancePaidMinor: number;
  readonly totalBalanceDueMinor: number;
  readonly upcomingDueDates: readonly {
    readonly vendorName: string;
    readonly amountMinor: number;
    readonly dueDate: string;
  }[];
}

/**
 * Calculates payment balances across all vendors.
 */
export function calculatePaymentSummary(
  vendors: readonly VendorPayment[],
  today: string
): PaymentSummary {
  let totalQuoted = 0;
  let totalAdvance = 0;
  let totalBalance = 0;
  const upcoming: { vendorName: string; amountMinor: number; dueDate: string }[] = [];

  for (const v of vendors) {
    totalQuoted += v.quotedMinor;
    totalAdvance += v.advancePaidMinor;

    const balance = Math.max(0, v.quotedMinor - v.advancePaidMinor);
    totalBalance += balance;

    if (balance > 0 && v.dueDate && v.dueDate >= today) {
      upcoming.push({
        vendorName: v.name,
        amountMinor: balance,
        dueDate: v.dueDate,
      });
    }
  }

  upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return {
    totalQuotedMinor: totalQuoted,
    totalAdvancePaidMinor: totalAdvance,
    totalBalanceDueMinor: totalBalance,
    upcomingDueDates: upcoming,
  };
}

/**
 * Converts vendor payment deadlines into timeline tasks so payment reminders
 * are directly visible on the timeline.
 */
export function generatePaymentTimelineTasks(
  vendors: readonly VendorPayment[],
  eventDate: string
): TimelineTask[] {
  const tasks: TimelineTask[] = [];

  for (const v of vendors) {
    const balance = Math.max(0, v.quotedMinor - v.advancePaidMinor);
    if (balance > 0 && v.dueDate) {
      tasks.push({
        id: `pay-${v.id}`,
        title: `Pay Balance to ${v.name}`,
        description: `Remaining balance due: ${v.balanceDueMinor} minor units before delivery.`,
        category: v.category,
        offsetDaysBeforeEvent: 0,
        calculatedDate: v.dueDate,
        dependsOn: [],
        status: v.dueDate < eventDate ? 'pending' : 'delayed',
        delayDays: 0,
        isMilestone: false,
      });
    }
  }

  return tasks;
}
