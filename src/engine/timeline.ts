/**
 * Mehfil - Deterministic Timeline Engine
 * Backward-planned task scheduling, topological sorting, dependency resolution,
 * and deterministic delay propagation. ZERO internal clock: `today` is always passed in.
 */

import type { OccasionType, TaskStatus, TimelineTask } from '../types';
import { DEFAULT_TIMELINE_TEMPLATES } from './timeline-templates';

export * from './timeline-templates';

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

  // Propagate delays through dependencies in topological iteration
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

  const isEventDateAtRisk = tasks.some((t) => t.calculatedDate > eventDate);

  return {
    overdueTasks,
    imminentTasks,
    isEventDateAtRisk,
  };
}
