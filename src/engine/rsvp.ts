/**
 * Mehfil - Deterministic RSVP & Catering Split Engine
 * Converts guest responses and dietary requirements into precise catering headcounts.
 */

import type { DietaryRequirement, GuestRSVP } from '../types';

export interface CateringSplitSummary {
  readonly totalInvited: number;
  readonly confirmedGuests: number;
  readonly tentativeGuests: number;
  readonly declinedGuests: number;
  readonly estimatedHeadcount: number;
  readonly dietaryCounts: Record<DietaryRequirement, number>;
  readonly standardMealsCount: number;
  readonly specialAllergyCount: number;
}

/**
 * Calculates catering headcount and dietary splits deterministically.
 */
export function calculateRSVPSummary(rsvps: readonly GuestRSVP[]): CateringSplitSummary {
  let confirmed = 0;
  let tentative = 0;
  let declined = 0;
  let totalInvited = 0;

  const dietaryCounts: Record<DietaryRequirement, number> = {
    veg: 0,
    vegan: 0,
    jain: 0,
    halal: 0,
    nut_free: 0,
    gluten_free: 0,
  };

  let specialAllergyCount = 0;

  for (const guest of rsvps) {
    const totalForGuest = 1 + Math.max(0, guest.plusOnes);
    totalInvited += totalForGuest;

    if (guest.status === 'yes') {
      confirmed += totalForGuest;

      // Attribute dietary preferences for confirmed attendees
      for (const req of guest.dietary) {
        dietaryCounts[req] = (dietaryCounts[req] ?? 0) + totalForGuest;
        if (req === 'nut_free' || req === 'gluten_free') {
          specialAllergyCount += totalForGuest;
        }
      }
    } else if (guest.status === 'maybe') {
      tentative += totalForGuest;
    } else if (guest.status === 'no') {
      declined += totalForGuest;
    }
  }

  // Estimated actual attendance: 100% of confirmed + 50% of tentative
  const estimatedHeadcount = confirmed + Math.floor(tentative * 0.5);

  // Standard meals: confirmed attendees who did not specify veg, vegan, or jain
  const specialDietaryTotal = dietaryCounts.veg + dietaryCounts.vegan + dietaryCounts.jain;
  const standardMealsCount = Math.max(0, confirmed - specialDietaryTotal);

  return {
    totalInvited,
    confirmedGuests: confirmed,
    tentativeGuests: tentative,
    declinedGuests: declined,
    estimatedHeadcount,
    dietaryCounts,
    standardMealsCount,
    specialAllergyCount,
  };
}

/**
 * Generates sample RSVP guests for demonstration / initialization.
 */
export function generateSampleRSVPs(): GuestRSVP[] {
  return [
    { id: 'rsvp-1', name: 'Rohan Sharma', status: 'yes', dietary: ['veg'], plusOnes: 1 },
    { id: 'rsvp-2', name: 'Priya Iyer', status: 'yes', dietary: ['vegan'], plusOnes: 0 },
    { id: 'rsvp-3', name: 'Amit Shah', status: 'yes', dietary: ['jain'], plusOnes: 2 },
    { id: 'rsvp-4', name: 'Sara Khan', status: 'yes', dietary: ['halal', 'nut_free'], plusOnes: 1 },
    { id: 'rsvp-5', name: 'Vikram Mehta', status: 'maybe', dietary: ['veg'], plusOnes: 1 },
    { id: 'rsvp-6', name: 'Ananya Reddy', status: 'no', dietary: [], plusOnes: 0 },
  ];
}
