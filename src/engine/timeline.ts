/**
 * Mehfil - Deterministic Timeline Engine
 * Backward-planned task scheduling, topological sorting, dependency resolution,
 * and deterministic delay propagation. ZERO internal clock: `today` is always passed in.
 */

import type { OccasionType, TaskStatus, TimelineTask } from '../types';

export interface TaskTemplate {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly offsetDaysBeforeEvent: number; // positive = days before event, 0 = event day
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

/**
 * Adds or subtracts days from an ISO date string (YYYY-MM-DD) deterministically.
 */
export function addDaysToDate(isoDate: string, days: number): string {
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const y = Number(yearStr);
  const m = Number(monthStr) - 1;
  const d = Number(dayStr);

  const date = new Date(Date.UTC(y, m, d));
  date.setUTCDate(date.getUTCDate() + days);

  const resYear = date.getUTCFullYear();
  const resMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const resDay = String(date.getUTCDate()).padStart(2, '0');
  return `${resYear}-${resMonth}-${resDay}`;
}

/**
 * Calculates calendar difference in days between two ISO dates (dateB - dateA).
 */
export function daysBetween(dateA: string, dateB: string): number {
  const [yA, mA, dA] = dateA.split('-').map(Number);
  const [yB, mB, dB] = dateB.split('-').map(Number);
  const msA = Date.UTC(yA ?? 0, (mA ?? 1) - 1, dA ?? 1);
  const msB = Date.UTC(yB ?? 0, (mB ?? 1) - 1, dB ?? 1);
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
}

/**
 * Computes scheduled dates for tasks backwards from eventDate,
 * and propagates delayDays forward through dependencies in topological order.
 */
export function calculateTimeline(
  tasks: readonly TimelineTask[],
  eventDate: string
): TimelineTask[] {
  // Map tasks by ID for quick lookup
  const taskMap = new Map<string, TimelineTask>();
  for (const t of tasks) {
    taskMap.set(t.id, { ...t });
  }

  // Backward plan base dates: eventDate - offsetDaysBeforeEvent
  for (const [id, t] of taskMap.entries()) {
    const baseDate = addDaysToDate(eventDate, -t.offsetDaysBeforeEvent);
    taskMap.set(id, {
      ...t,
      calculatedDate: baseDate,
    });
  }

  // Propagate delays through dependencies
  // A task cannot be scheduled before any of its prerequisites are completed + their delays
  let changed = true;
  let iterations = 0;
  const maxIterations = tasks.length * 2 + 10;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const [id, current] of taskMap.entries()) {
      let effectiveDate = addDaysToDate(
        addDaysToDate(eventDate, -current.offsetDaysBeforeEvent),
        current.delayDays
      );

      for (const parentId of current.dependsOn) {
        const parent = taskMap.get(parentId);
        if (parent) {
          // If parent is scheduled on or after current, current must be pushed after parent
          if (parent.calculatedDate >= effectiveDate) {
            effectiveDate = addDaysToDate(parent.calculatedDate, 1);
          }
        }
      }

      if (effectiveDate !== current.calculatedDate) {
        taskMap.set(id, {
          ...current,
          calculatedDate: effectiveDate,
        });
        changed = true;
      }
    }
  }

  return Array.from(taskMap.values()).sort((a, b) => {
    if (a.calculatedDate !== b.calculatedDate) {
      return a.calculatedDate.localeCompare(b.calculatedDate);
    }
    return b.offsetDaysBeforeEvent - a.offsetDaysBeforeEvent;
  });
}

/**
 * Initializes timeline tasks from default templates for a given occasion.
 */
export function initializeTimeline(occasion: OccasionType, eventDate: string): TimelineTask[] {
  const templates = DEFAULT_TIMELINE_TEMPLATES[occasion];
  const initial: TimelineTask[] = templates.map((tmpl) => ({
    id: tmpl.id,
    title: tmpl.title,
    description: tmpl.description,
    category: tmpl.category,
    offsetDaysBeforeEvent: tmpl.offsetDaysBeforeEvent,
    calculatedDate: addDaysToDate(eventDate, -tmpl.offsetDaysBeforeEvent),
    dependsOn: tmpl.dependsOn,
    status: 'pending' as TaskStatus,
    delayDays: 0,
    isMilestone: tmpl.isMilestone ?? false,
  }));

  return calculateTimeline(initial, eventDate);
}

/**
 * Assesses risk levels for tasks given the current date `today`.
 */
export function assessTimelineRisks(
  tasks: readonly TimelineTask[],
  today: string,
  eventDate: string
): {
  overdueTasks: TimelineTask[];
  imminentTasks: TimelineTask[];
  isEventDateAtRisk: boolean;
} {
  const overdueTasks: TimelineTask[] = [];
  const imminentTasks: TimelineTask[] = [];

  for (const task of tasks) {
    if (task.status === 'completed') continue;

    const diffToToday = daysBetween(today, task.calculatedDate);
    if (diffToToday < 0) {
      overdueTasks.push(task);
    } else if (diffToToday <= 3) {
      imminentTasks.push(task);
    }
  }

  // Check if any task is scheduled past eventDate
  const isEventDateAtRisk = tasks.some((t) => t.calculatedDate > eventDate);

  return {
    overdueTasks,
    imminentTasks,
    isEventDateAtRisk,
  };
}
