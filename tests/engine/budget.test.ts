import { describe, it, expect } from 'vitest';
import {
  distributeIntegerLargestRemainder,
  calculateBudgetSplit,
  initializeBudgetCategories,
  DEFAULT_CATEGORY_TEMPLATES,
} from '../../src/engine/budget';
import type { CategoryBudget } from '../../src/types';

describe('Budget Engine - Unit & Property Tests', () => {
  it('distributes integer budget with largest-remainder exact sum guarantee', () => {
    const total = 10000;
    const weights = [30, 25, 15, 12, 8, 6, 4];
    const distributed = distributeIntegerLargestRemainder(total, weights);

    const sum = distributed.reduce((a, b) => a + b, 0);
    expect(sum).toBe(total);
  });

  it('handles edge case of zero or empty distribution', () => {
    expect(distributeIntegerLargestRemainder(0, [10, 20])).toEqual([0, 0]);
    expect(distributeIntegerLargestRemainder(100, [])).toEqual([]);
    expect(distributeIntegerLargestRemainder(10, [0, 0])).toEqual([5, 5]);
  });

  it('respects locked categories while reallocating remaining budget', () => {
    const categories: CategoryBudget[] = [
      {
        id: 'c1',
        name: 'Venue',
        baseWeight: 40,
        allocatedMinor: 4000,
        spentMinor: 0,
        isLocked: true,
        priority: 'essential',
      },
      {
        id: 'c2',
        name: 'Catering',
        baseWeight: 40,
        allocatedMinor: 0,
        spentMinor: 0,
        isLocked: false,
        priority: 'essential',
      },
      {
        id: 'c3',
        name: 'Decor',
        baseWeight: 20,
        allocatedMinor: 0,
        spentMinor: 0,
        isLocked: false,
        priority: 'desired',
      },
    ];

    const result = calculateBudgetSplit(10000, 10, categories);

    // 10% contingency of 10000 = 1000
    expect(result.contingencyMinor).toBe(1000);
    expect(result.availableMinor).toBe(9000);

    const c1 = result.categories.find((c) => c.id === 'c1');
    expect(c1?.allocatedMinor).toBe(4000); // locked amount remains untouched

    const allocatedSum = result.categories.reduce((acc, c) => acc + c.allocatedMinor, 0);
    expect(allocatedSum + result.contingencyMinor).toBe(10000);
  });

  it('initializes budget categories properly for all occasion types', () => {
    const occasions = ['wedding', 'birthday', 'community', 'milestone'] as const;
    for (const occ of occasions) {
      const res = initializeBudgetCategories(occ, 6000000, 10);
      expect(res.categories.length).toBe(DEFAULT_CATEGORY_TEMPLATES[occ].length);
      const totalSum =
        res.categories.reduce((a, b) => a + b.allocatedMinor, 0) + res.contingencyMinor;
      expect(totalSum).toBe(6000000);
    }
  });

  // PROPERTY-BASED TEST (Fuzzing 100 random combinations)
  it('PROPERTY TEST: arbitrary random budgets and weights always sum exactly to totalMinor', () => {
    for (let i = 0; i < 100; i++) {
      const randomTotal = Math.floor(Math.random() * 50000000) + 100;
      const randomContingency = Math.floor(Math.random() * 25);
      const categoryCount = Math.floor(Math.random() * 8) + 2;

      const randomCategories: CategoryBudget[] = Array.from(
        { length: categoryCount },
        (_, idx) => ({
          id: `cat-${idx}`,
          name: `Category ${idx}`,
          baseWeight: Math.floor(Math.random() * 40) + 5,
          allocatedMinor: 0,
          spentMinor: 0,
          isLocked: false,
          priority: 'essential',
        })
      );

      const result = calculateBudgetSplit(randomTotal, randomContingency, randomCategories);
      const sum =
        result.categories.reduce((acc, c) => acc + c.allocatedMinor, 0) + result.contingencyMinor;

      expect(sum).toBe(randomTotal);
    }
  });
});
