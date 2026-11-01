/**
 * Mehfil - Default Timeline Templates
 * Occasion milestone definitions and dependencies.
 */

import type { OccasionType } from '../types';

export interface TaskTemplate {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly offsetDaysBeforeEvent: number;
  readonly dependsOn: readonly string[];
  readonly isMilestone?: boolean;
}

export const DEFAULT_TIMELINE_TEMPLATES: Record<OccasionType, readonly TaskTemplate[]> = {
  wedding: [
    {
      id: 'w-venue',
      title: 'Book Venue & Finalize Dates',
      description: 'Tour and lock in ceremony and reception halls',
      category: 'venue',
      offsetDaysBeforeEvent: 120,
      dependsOn: [],
      isMilestone: true,
    },
    {
      id: 'w-catering',
      title: 'Catering Menu Tasting & Contract',
      description: 'Select final menu items and sign catering contract',
      category: 'catering',
      offsetDaysBeforeEvent: 90,
      dependsOn: ['w-venue'],
    },
    {
      id: 'w-invites-send',
      title: 'Dispatch Wedding Invitations',
      description: 'Send physical cards and digital RSVP links',
      category: 'invitations',
      offsetDaysBeforeEvent: 60,
      dependsOn: ['w-venue'],
      isMilestone: true,
    },
    {
      id: 'w-photo',
      title: 'Finalize Photographer Shot List',
      description: 'Coordinate schedule for key portraits and rituals',
      category: 'photography',
      offsetDaysBeforeEvent: 30,
      dependsOn: ['w-venue'],
    },
    {
      id: 'w-decor',
      title: 'Stage & Floral Walkthrough',
      description: 'Sign off on mandap/backdrop samples and lighting setup',
      category: 'decor',
      offsetDaysBeforeEvent: 14,
      dependsOn: ['w-venue'],
    },
    {
      id: 'w-final-count',
      title: 'Lock Final Headcount with Caterer',
      description: 'Pass confirmed RSVP numbers and dietary requests',
      category: 'catering',
      offsetDaysBeforeEvent: 7,
      dependsOn: ['w-invites-send', 'w-catering'],
      isMilestone: true,
    },
    {
      id: 'w-event-day',
      title: 'Wedding Celebration Day',
      description: 'Execute ceremonies according to master run sheet',
      category: 'venue',
      offsetDaysBeforeEvent: 0,
      dependsOn: ['w-final-count', 'w-decor'],
      isMilestone: true,
    },
  ],
  birthday: [
    {
      id: 'b-theme',
      title: 'Choose Theme & Book Venue',
      description: 'Decide birthday theme and reserve party space',
      category: 'venue',
      offsetDaysBeforeEvent: 30,
      dependsOn: [],
      isMilestone: true,
    },
    {
      id: 'b-invites',
      title: 'Send Digital Party Invites',
      description: 'Send WhatsApp or email invites with RSVP date',
      category: 'decor',
      offsetDaysBeforeEvent: 20,
      dependsOn: ['b-theme'],
    },
    {
      id: 'b-cake',
      title: 'Order Custom Cake & Food',
      description: 'Confirm flavor, weight, delivery time, and snacks',
      category: 'catering',
      offsetDaysBeforeEvent: 10,
      dependsOn: ['b-theme'],
    },
    {
      id: 'b-favors',
      title: 'Assemble Return Gifts & Decor',
      description: 'Pack goodie bags and prep balloons/props',
      category: 'entertainment',
      offsetDaysBeforeEvent: 3,
      dependsOn: ['b-invites'],
    },
    {
      id: 'b-event-day',
      title: 'Birthday Celebration Party',
      description: 'Setup, welcome guests, games, and cake cutting',
      category: 'venue',
      offsetDaysBeforeEvent: 0,
      dependsOn: ['b-cake', 'b-favors'],
      isMilestone: true,
    },
  ],
  community: [
    {
      id: 'c-permits',
      title: 'Apply for Local Municipality Permits',
      description: 'Submit paperwork for sound, venue, and traffic permissions',
      category: 'permits',
      offsetDaysBeforeEvent: 45,
      dependsOn: [],
      isMilestone: true,
    },
    {
      id: 'c-ground',
      title: 'Reserve Public Grounds / Facility',
      description: 'Lock in park or community center lease agreement',
      category: 'venue',
      offsetDaysBeforeEvent: 35,
      dependsOn: ['c-permits'],
    },
    {
      id: 'c-roster',
      title: 'Publish Volunteer Roster & Shifts',
      description: 'Assign check-in, safety, food, and cleanup crews',
      category: 'safety',
      offsetDaysBeforeEvent: 14,
      dependsOn: ['c-ground'],
      isMilestone: true,
    },
    {
      id: 'c-av-setup',
      title: 'Audio-Visual & Stage Soundcheck',
      description: 'Verify mic, speakers, stage generators, and wiring',
      category: 'equipment',
      offsetDaysBeforeEvent: 1,
      dependsOn: ['c-ground'],
    },
    {
      id: 'c-event-day',
      title: 'Community Gathering Day',
      description: 'Coordinate activities, volunteer shifts, and public reception',
      category: 'venue',
      offsetDaysBeforeEvent: 0,
      dependsOn: ['c-roster', 'c-av-setup'],
      isMilestone: true,
    },
  ],
  milestone: [
    {
      id: 'm-venue',
      title: 'Book Private Dining or Banquet Suite',
      description: 'Reserve private dining room or banquet facility',
      category: 'venue',
      offsetDaysBeforeEvent: 60,
      dependsOn: [],
      isMilestone: true,
    },
    {
      id: 'm-program',
      title: 'Curate Program, Speeches & Slideshow',
      description: 'Collect vintage photos and coordinate family speakers',
      category: 'mementos',
      offsetDaysBeforeEvent: 21,
      dependsOn: ['m-venue'],
    },
    {
      id: 'm-photo',
      title: 'Confirm Portrait Photographer',
      description: 'Lock in group family portrait session time',
      category: 'photography',
      offsetDaysBeforeEvent: 14,
      dependsOn: ['m-venue'],
    },
    {
      id: 'm-event-day',
      title: 'Milestone Celebration Gathering',
      description: 'Toast, honors, slideshow, dinner, and memories',
      category: 'venue',
      offsetDaysBeforeEvent: 0,
      dependsOn: ['m-program', 'm-photo'],
      isMilestone: true,
    },
  ],
};
