import { describe, it, expect } from 'vitest';
import { initializeVendors, calculateVendorMetrics } from '../../src/engine/checklist';
import { calculateRSVPSummary, generateSampleRSVPs } from '../../src/engine/rsvp';
import { calculateCommunitySummary, generateSampleCommunityData } from '../../src/engine/community';
import { calculatePaymentSummary, generatePaymentTimelineTasks } from '../../src/engine/payments';
import { cloneScenario, compareScenarios } from '../../src/engine/scenario';
import {
  generateICalendar,
  encodeShareablePlan,
  decodeShareablePlan,
} from '../../src/engine/export';
import { fallbackParseIntake } from '../../src/engine/intake';
import { initializeBudgetCategories } from '../../src/engine/budget';
import { initializeTimeline } from '../../src/engine/timeline';
import type { MehfilPlan, VendorPayment } from '../../src/types';

describe('Checklist, RSVP, Community, Payments, Scenario & Export Engine Tests', () => {
  it('calculates vendor checklist completion metrics', () => {
    const vendors: VendorPayment[] = [
      {
        id: 'v1',
        category: 'venue',
        name: 'Venue',
        status: 'booked',
        quotedMinor: 50000,
        advancePaidMinor: 20000,
        balanceDueMinor: 30000,
      },
      {
        id: 'v2',
        category: 'catering',
        name: 'Caterer',
        status: 'completed',
        quotedMinor: 30000,
        advancePaidMinor: 30000,
        balanceDueMinor: 0,
      },
      {
        id: 'v3',
        category: 'decor',
        name: 'Decorator',
        status: 'not_started',
        quotedMinor: 0,
        advancePaidMinor: 0,
        balanceDueMinor: 0,
      },
    ];

    const emptyMetrics = calculateVendorMetrics([]);
    expect(emptyMetrics.totalCount).toBe(0);
    expect(emptyMetrics.completionPercentage).toBe(100);

    const metrics = calculateVendorMetrics(vendors);
    expect(metrics.totalCount).toBe(3);
    expect(metrics.bookedOrCompletedCount).toBe(2);
    expect(metrics.completionPercentage).toBe(67);
  });

  it('calculates RSVP headcounts and catering dietary splits accurately', () => {
    const rsvps = generateSampleRSVPs();
    const summary = calculateRSVPSummary(rsvps);

    expect(summary.totalInvited).toBeGreaterThan(0);
    expect(summary.confirmedGuests).toBeGreaterThan(0);
    expect(summary.estimatedHeadcount).toBeGreaterThanOrEqual(summary.confirmedGuests);
    expect(summary.dietaryCounts.veg).toBeGreaterThanOrEqual(1);
    expect(summary.dietaryCounts.vegan).toBeGreaterThanOrEqual(1);
  });

  it('calculates community volunteer, permit and sponsorship metrics', () => {
    const { volunteers, permits, sponsors } = generateSampleCommunityData();
    const summary = calculateCommunitySummary(volunteers, permits, sponsors);

    expect(summary.totalVolunteers).toBe(volunteers.length);
    expect(summary.totalPermits).toBe(permits.length);
    expect(summary.totalSponsorshipCommittedMinor).toBeGreaterThan(0);
    expect(summary.sponsorshipFundingGapMinor).toBeGreaterThanOrEqual(0);
  });

  it('calculates payments summary and generates reminder tasks', () => {
    const vendors: VendorPayment[] = [
      {
        id: 'v1',
        category: 'venue',
        name: 'Royal Hall',
        status: 'booked',
        quotedMinor: 1000000,
        advancePaidMinor: 400000,
        balanceDueMinor: 600000,
        dueDate: '2026-11-20',
      },
      {
        id: 'v2',
        category: 'catering',
        name: 'Spicy Feasts',
        status: 'quoted',
        quotedMinor: 500000,
        advancePaidMinor: 0,
        balanceDueMinor: 500000,
        dueDate: '2026-11-25',
      },
    ];

    const summary = calculatePaymentSummary(vendors, '2026-11-01');
    expect(summary.totalQuotedMinor).toBe(1500000);
    expect(summary.totalAdvancePaidMinor).toBe(400000);
    expect(summary.totalBalanceDueMinor).toBe(1100000);
    expect(summary.upcomingDueDates.length).toBe(2);

    const tasks = generatePaymentTimelineTasks(vendors, '2026-12-01');
    expect(tasks.length).toBe(2);
  });

  it('clones scenario B and compares side-by-side diffs', () => {
    const budgetInit = initializeBudgetCategories('birthday', 6000000, 10);
    const timelineInit = initializeTimeline('birthday', '2026-12-15');
    const vendorsInit = initializeVendors('birthday');

    const basePlan: MehfilPlan = {
      id: 'plan-test',
      title: 'Birthday Celebration',
      occasion: 'birthday',
      eventDate: '2026-12-15',
      location: 'Bengaluru',
      guestCount: 40,
      budget: {
        totalMinor: 6000000,
        currency: 'INR',
        contingencyPercent: 10,
        contingencyMinor: budgetInit.contingencyMinor,
        categories: budgetInit.categories,
      },
      timeline: timelineInit,
      vendors: vendorsInit,
      rsvps: [],
      volunteers: [],
      permits: [],
      sponsors: [],
      notes: '',
      createdAt: '2026-11-01',
      updatedAt: '2026-11-01',
    };

    const scenarioB = cloneScenario(basePlan, {
      guestCount: 30,
      totalBudgetMinor: 4500000,
    });

    expect(scenarioB.guestCount).toBe(30);
    expect(scenarioB.budget.totalMinor).toBe(4500000);

    const diff = compareScenarios(basePlan, scenarioB);
    expect(diff.totalBudgetDeltaMinor).toBe(-1500000);
    expect(diff.guestCountDelta).toBe(-10);
    expect(diff.riskAnalysis.length).toBeGreaterThan(0);

    const scenarioC = cloneScenario(basePlan, {
      guestCount: 60,
      totalBudgetMinor: 8000000,
    });
    const diffC = compareScenarios(basePlan, scenarioC);
    expect(diffC.guestCountDelta).toBe(20);
    expect(diffC.totalBudgetDeltaMinor).toBe(2000000);
  });

  it('throws an error if plan exceeds 32 KB payload size limit', () => {
    const hugePlan = {
      notes: 'x'.repeat(40000),
    } as unknown as MehfilPlan;

    expect(() => encodeShareablePlan(hugePlan)).toThrow('Plan payload exceeds 32 KB size cap.');
  });

  it('exports valid RFC 5545 iCalendar string and encodes/decodes shareable URL payloads', () => {
    const budgetInit = initializeBudgetCategories('birthday', 6000000, 10);
    const timelineInit = initializeTimeline('birthday', '2026-12-15');
    const vendorsInit = initializeVendors('birthday');

    const plan: MehfilPlan = {
      id: 'plan-export-test',
      title: 'Aarav Birthday Party',
      occasion: 'birthday',
      eventDate: '2026-12-15',
      location: 'Bengaluru',
      guestCount: 40,
      budget: {
        totalMinor: 6000000,
        currency: 'INR',
        contingencyPercent: 10,
        contingencyMinor: budgetInit.contingencyMinor,
        categories: budgetInit.categories,
      },
      timeline: timelineInit,
      vendors: vendorsInit,
      rsvps: [],
      volunteers: [],
      permits: [],
      sponsors: [],
      notes: 'No peanuts',
      createdAt: '2026-11-01',
      updatedAt: '2026-11-01',
    };

    const ics = generateICalendar(plan);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('Aarav Birthday Party');

    const encoded = encodeShareablePlan(plan);
    expect(typeof encoded).toBe('string');

    const decoded = decodeShareablePlan(encoded);
    expect(decoded.title).toBe(plan.title);
    expect(decoded.budget.totalMinor).toBe(plan.budget.totalMinor);
  });

  it('deterministically parses natural language intake parameters with fallback engine', () => {
    const res = fallbackParseIntake(
      'Birthday for 40 kids in Bengaluru, 60k budget, next month',
      '2026-11-01'
    );
    expect(res.occasion).toBe('birthday');
    expect(res.guestCount).toBe(40);
    expect(res.location).toBe('Bengaluru');
    expect(res.totalBudgetMinor).toBe(6000000);
    expect(res.eventDate).toBe('2026-12-01');
    expect(res.isFallback).toBe(true);

    const wedding = fallbackParseIntake(
      'Shaadi in Jaipur for 200 guests with 10 lakh',
      '2026-11-01'
    );
    expect(wedding.occasion).toBe('wedding');
    expect(wedding.location).toBe('Jaipur');
    expect(wedding.guestCount).toBe(200);
    expect(wedding.totalBudgetMinor).toBe(100000000);
  });
});
