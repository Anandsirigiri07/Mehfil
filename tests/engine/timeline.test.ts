import { describe, it, expect } from 'vitest';
import {
  addDaysToDate,
  daysBetween,
  calculateTimeline,
  initializeTimeline,
  assessTimelineRisks,
} from '../../src/engine/timeline';
import type { TimelineTask } from '../../src/types';

describe('Timeline Engine - Unit & Property Tests', () => {
  it('adds and subtracts days accurately from ISO dates', () => {
    expect(addDaysToDate('2026-11-01', 5)).toBe('2026-11-06');
    expect(addDaysToDate('2026-11-01', -10)).toBe('2026-10-22');
    expect(addDaysToDate('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('calculates days between two dates deterministically', () => {
    expect(daysBetween('2026-11-01', '2026-11-15')).toBe(14);
    expect(daysBetween('2026-11-15', '2026-11-01')).toBe(-14);
  });

  it('propagates delays through dependencies', () => {
    const tasks: TimelineTask[] = [
      {
        id: 'task-1',
        title: 'Task 1',
        description: 'First',
        category: 'venue',
        offsetDaysBeforeEvent: 30,
        calculatedDate: '2026-11-01',
        dependsOn: [],
        status: 'pending',
        delayDays: 10, // 10 days delay
      },
      {
        id: 'task-2',
        title: 'Task 2',
        description: 'Dependent',
        category: 'catering',
        offsetDaysBeforeEvent: 25,
        calculatedDate: '2026-11-06',
        dependsOn: ['task-1'],
        status: 'pending',
        delayDays: 0,
      },
    ];

    const result = calculateTimeline(tasks, '2026-12-01');
    const t1 = result.find((t) => t.id === 'task-1');
    const t2 = result.find((t) => t.id === 'task-2');

    expect(t1).toBeDefined();
    expect(t2).toBeDefined();

    // t2 must be scheduled after t1
    expect(t2!.calculatedDate > t1!.calculatedDate).toBe(true);
  });

  it('identifies overdue and imminent task risks', () => {
    const tasks: TimelineTask[] = [
      {
        id: 't-overdue',
        title: 'Overdue Task',
        description: '',
        category: 'venue',
        offsetDaysBeforeEvent: 40,
        calculatedDate: '2026-10-20',
        dependsOn: [],
        status: 'pending',
        delayDays: 0,
      },
      {
        id: 't-imminent',
        title: 'Imminent Task',
        description: '',
        category: 'catering',
        offsetDaysBeforeEvent: 2,
        calculatedDate: '2026-11-03',
        dependsOn: [],
        status: 'pending',
        delayDays: 0,
      },
    ];

    const risks = assessTimelineRisks(tasks, '2026-11-01', '2026-11-05');
    expect(risks.overdueTasks.length).toBe(1);
    expect(risks.imminentTasks.length).toBe(1);
  });

  // PROPERTY TEST (Timeline chronological integrity under arbitrary delays)
  it('PROPERTY TEST: dependent tasks are never scheduled before their predecessors', () => {
    for (let i = 0; i < 50; i++) {
      const eventDate = '2027-06-01';
      const initial = initializeTimeline('wedding', eventDate);

      // Apply random delays to tasks
      const withRandomDelays: TimelineTask[] = initial.map((t) => ({
        ...t,
        delayDays: Math.floor(Math.random() * 20),
      }));

      const computed = calculateTimeline(withRandomDelays, eventDate);
      const computedMap = new Map(computed.map((t) => [t.id, t]));

      for (const task of computed) {
        for (const depId of task.dependsOn) {
          const dep = computedMap.get(depId);
          if (dep) {
            expect(task.calculatedDate >= dep.calculatedDate).toBe(true);
          }
        }
      }
    }
  });
});
