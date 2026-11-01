import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Play } from 'lucide-react';
import type { TimelineTask } from '../../types';
import { assessTimelineRisks } from '../../engine/timeline';

interface TimelineSectionProps {
  tasks: readonly TimelineTask[];
  eventDate: string;
  today: string;
  onUpdateTaskStatus: (taskId: string, status: TimelineTask['status']) => void;
  onSimulateDelay: (taskId: string, delayDays: number) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  tasks,
  eventDate,
  today,
  onUpdateTaskStatus,
  onSimulateDelay,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [simulatedDays, setSimulatedDays] = useState<number>(3);

  const risks = assessTimelineRisks(tasks, today, eventDate);

  const statusIcons: Record<
    TimelineTask['status'],
    { icon: typeof Clock; color: string; label: string }
  > = {
    pending: { icon: Clock, color: 'text-stone-400', label: 'Pending' },
    in_progress: { icon: Play, color: 'text-amber-500', label: 'In Progress' },
    completed: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Completed' },
    delayed: { icon: AlertTriangle, color: 'text-rose-500', label: 'Delayed' },
  };

  return (
    <section aria-labelledby="timeline-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            id="timeline-heading"
            className="text-xl font-bold text-stone-900 dark:text-stone-100"
          >
            Backward-Planned Master Timeline
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Milestones mapped backwards from target event date ({eventDate}). Delays propagate
            dynamically across dependencies.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
          <Calendar className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
          <span>Today: {today}</span>
        </div>
      </div>

      {/* Risk Alert Banners */}
      {risks.isEventDateAtRisk && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200 flex items-start gap-3 shadow-sm"
        >
          <AlertTriangle
            className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-bold text-sm">Critical Schedule Conflict</h3>
            <p className="text-xs mt-0.5">
              One or more tasks are delayed past the official event date ({eventDate}). Re-evaluate
              task deadlines or expedite vendor contracts.
            </p>
          </div>
        </div>
      )}

      {/* Delay Simulation Panel */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Delay Propagation Simulator
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="simulate-task-select"
            className="text-xs text-stone-600 dark:text-stone-400"
          >
            Select Task:
          </label>
          <select
            id="simulate-task-select"
            value={selectedTaskId ?? ''}
            onChange={(e) => setSelectedTaskId(e.target.value || null)}
            className="text-xs rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
          >
            <option value="">-- Choose task to delay --</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.calculatedDate})
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={30}
            value={simulatedDays}
            onChange={(e) => setSimulatedDays(Number(e.target.value))}
            className="w-16 text-xs rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            aria-label="Days delay"
          />
          <button
            type="button"
            disabled={!selectedTaskId}
            onClick={() => {
              if (selectedTaskId) {
                onSimulateDelay(selectedTaskId, simulatedDays);
              }
            }}
            className="touch-target px-3 py-1.5 text-xs font-semibold rounded-lg bg-mehfil-600 hover:bg-mehfil-700 disabled:opacity-50 text-white transition-colors"
          >
            Simulate Delay (+{simulatedDays}d)
          </button>
        </div>
      </div>

      {/* Task List Sequence */}
      <div className="space-y-3">
        {tasks.map((task, idx) => {
          const cfg = statusIcons[task.status];
          const Icon = cfg.icon;
          const isOverdue = risks.overdueTasks.some((t) => t.id === task.id);

          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all ${
                isOverdue
                  ? 'border-rose-400 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
              } shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono font-bold text-stone-400 dark:text-stone-500 w-6 pt-0.5">
                  #{idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {task.title}
                    </h3>
                    {task.isMilestone && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Milestone
                      </span>
                    )}
                    {task.delayDays > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        +{task.delayDays}d delay
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    {task.description}
                  </p>
                  {task.dependsOn.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      <span>Depends on:</span>
                      <span className="font-mono">{task.dependsOn.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                    <span>{task.calculatedDate}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    {task.offsetDaysBeforeEvent === 0
                      ? 'Event Day'
                      : `${task.offsetDaysBeforeEvent}d before`}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <select
                    aria-label={`Status for ${task.title}`}
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTaskStatus(task.id, e.target.value as TimelineTask['status'])
                    }
                    className="text-xs rounded-lg border border-stone-300 bg-white p-1.5 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                  <Icon className={`w-4 h-4 ${cfg.color} shrink-0`} aria-hidden="true" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
