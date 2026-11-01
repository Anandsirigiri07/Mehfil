/**
 * Mehfil - Vendor Checklist Engine
 * Deterministic vendor lifecycle tracking and milestone checks.
 */

import type { OccasionType, VendorPayment, VendorStatus } from '../types';

export interface VendorTemplate {
  readonly id: string;
  readonly category: string;
  readonly name: string;
  readonly defaultStatus: VendorStatus;
  readonly notes: string;
}

export const DEFAULT_VENDOR_TEMPLATES: Record<OccasionType, readonly VendorTemplate[]> = {
  wedding: [
    {
      id: 'v-venue',
      category: 'venue',
      name: 'Ceremony & Banquet Hall',
      defaultStatus: 'not_started',
      notes: 'Check parking capacity, air conditioning, and decor restrictions',
    },
    {
      id: 'v-caterer',
      category: 'catering',
      name: 'Master Caterer & Live Counters',
      defaultStatus: 'not_started',
      notes: 'Request regional specialties, welcome drinks, and desserts',
    },
    {
      id: 'v-photo',
      category: 'photography',
      name: 'Candid & Traditional Photographer',
      defaultStatus: 'not_started',
      notes: 'Inquire about drone permissions and raw footage delivery timelines',
    },
    {
      id: 'v-decor',
      category: 'decor',
      name: 'Floral & Mandap Stage Decorator',
      defaultStatus: 'not_started',
      notes: 'Match color palette with bride and groom attire',
    },
    {
      id: 'v-dj',
      category: 'entertainment',
      name: 'Sound, DJ & Sangeet MC',
      defaultStatus: 'not_started',
      notes: 'Confirm mic set for speeches and sangeet playlist curate',
    },
  ],
  birthday: [
    {
      id: 'v-venue-bday',
      category: 'venue',
      name: 'Party Hall / Play Zone',
      defaultStatus: 'not_started',
      notes: 'Ensure safety padding and space for children activities',
    },
    {
      id: 'v-baker',
      category: 'catering',
      name: 'Theme Cake Baker',
      defaultStatus: 'not_started',
      notes: 'Confirm eggless/allergen options and delivery slot',
    },
    {
      id: 'v-entertainer',
      category: 'entertainment',
      name: 'Magician / Balloon Artist',
      defaultStatus: 'not_started',
      notes: 'Confirm 45-minute interactive show time',
    },
    {
      id: 'v-favors',
      category: 'decor',
      name: 'Custom Goodie Bag Supplier',
      defaultStatus: 'not_started',
      notes: 'Order 10% extra for surprise attendees',
    },
  ],
  community: [
    {
      id: 'v-sound',
      category: 'equipment',
      name: 'PA Sound System & Stage Mic',
      defaultStatus: 'not_started',
      notes: 'Requires generator backup for outdoor grounds',
    },
    {
      id: 'v-tent',
      category: 'venue',
      name: 'Shamiana / Canopy & Chairs Rental',
      defaultStatus: 'not_started',
      notes: 'Capacity for shade and seating',
    },
    {
      id: 'v-waste',
      category: 'safety',
      name: 'Waste Management & Bins Contractor',
      defaultStatus: 'not_started',
      notes: 'Arrange segregation: wet, dry, recyclable',
    },
  ],
  milestone: [
    {
      id: 'v-hall',
      category: 'venue',
      name: 'Private Dining Room / Club Lounge',
      defaultStatus: 'not_started',
      notes: 'Comfortable seating and accessible restrooms for senior guests',
    },
    {
      id: 'v-portrait',
      category: 'photography',
      name: 'Generational Portrait Specialist',
      defaultStatus: 'not_started',
      notes: 'Book studio setup on-site for immediate family groups',
    },
    {
      id: 'v-cater-deluxe',
      category: 'catering',
      name: 'Custom Multi-Course Caterer',
      defaultStatus: 'not_started',
      notes: 'Dietary-sensitive options for senior guests',
    },
  ],
};

/**
 * Initializes vendor checklist for a specified occasion.
 */
export function initializeVendors(occasion: OccasionType): VendorPayment[] {
  const templates = DEFAULT_VENDOR_TEMPLATES[occasion];
  return templates.map((tmpl) => ({
    id: tmpl.id,
    category: tmpl.category,
    name: tmpl.name,
    status: tmpl.defaultStatus,
    quotedMinor: 0,
    advancePaidMinor: 0,
    balanceDueMinor: 0,
    notes: tmpl.notes,
  }));
}

/**
 * Calculates completion metrics across vendor list.
 */
export function calculateVendorMetrics(vendors: readonly VendorPayment[]): {
  totalCount: number;
  bookedOrCompletedCount: number;
  completionPercentage: number;
  pendingQuotesCount: number;
} {
  const totalCount = vendors.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      bookedOrCompletedCount: 0,
      completionPercentage: 100,
      pendingQuotesCount: 0,
    };
  }

  let bookedOrCompleted = 0;
  let pendingQuotes = 0;

  for (const v of vendors) {
    if (v.status === 'booked' || v.status === 'completed') {
      bookedOrCompleted++;
    } else if (v.status === 'not_started' || v.status === 'contacted') {
      pendingQuotes++;
    }
  }

  const completionPercentage = Math.round((bookedOrCompleted / totalCount) * 100);

  return {
    totalCount,
    bookedOrCompletedCount: bookedOrCompleted,
    completionPercentage,
    pendingQuotesCount: pendingQuotes,
  };
}
