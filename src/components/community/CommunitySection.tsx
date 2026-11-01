import React from 'react';
import { ShieldCheck, Award, HeartHandshake, CheckCircle } from 'lucide-react';
import type { CommunityPermit, CommunitySponsor, CommunityVolunteer } from '../../types';
import { calculateCommunitySummary } from '../../engine/community';

interface CommunitySectionProps {
  volunteers: readonly CommunityVolunteer[];
  permits: readonly CommunityPermit[];
  sponsors: readonly CommunitySponsor[];
  onUpdatePermitStatus: (id: string, status: CommunityPermit['status']) => void;
  onUpdateVolunteerStatus: (id: string, status: CommunityVolunteer['status']) => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  volunteers,
  permits,
  sponsors,
  onUpdatePermitStatus,
  onUpdateVolunteerStatus,
}) => {
  const summary = calculateCommunitySummary(volunteers, permits, sponsors);

  return (
    <section aria-labelledby="community-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            id="community-heading"
            className="text-xl font-bold text-stone-900 dark:text-stone-100"
          >
            Community Event Hub & Operations
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Volunteer shifts, municipal permit safety approvals, and community sponsor
            contributions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
          <HeartHandshake className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
          <span>
            {summary.confirmedVolunteers} / {summary.totalVolunteers} Volunteers Confirmed
          </span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Permit Status</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {summary.approvedPermits} of {summary.totalPermits} Approved
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {summary.pendingPermits} clearances pending
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase">
            <Award className="w-4 h-4 text-purple-600" aria-hidden="true" />
            <span>Sponsorship Raised</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            ₹{(summary.totalSponsorshipReceivedMinor / 100).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            ₹{(summary.totalSponsorshipCommittedMinor / 100).toLocaleString('en-IN')} committed
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase">
            <CheckCircle className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span>Funding Gap</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            ₹{(summary.sponsorshipFundingGapMinor / 100).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Outstanding receivables
          </div>
        </div>
      </div>

      {/* Permits Table */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
          <span>Statutory Permissions & Safety Clearances</span>
        </h3>
        <div className="space-y-2">
          {permits.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block">{p.name}</span>
                <span className="text-stone-500 dark:text-stone-400">
                  Authority: {p.authority} • Deadline: {p.deadline}
                </span>
              </div>
              <div>
                <select
                  aria-label={`Status for ${p.name}`}
                  value={p.status}
                  onChange={(e) =>
                    onUpdatePermitStatus(p.id, e.target.value as CommunityPermit['status'])
                  }
                  className="rounded-lg border border-stone-300 bg-white p-1.5 text-xs dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="required">Required</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Roster */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
          <span>Volunteer Roster & Shift Assignments</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {volunteers.map((vol) => (
            <div
              key={vol.id}
              className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block">
                  {vol.name}
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  {vol.role} ({vol.shift})
                </span>
              </div>
              <select
                aria-label={`Status for volunteer ${vol.name}`}
                value={vol.status}
                onChange={(e) =>
                  onUpdateVolunteerStatus(vol.id, e.target.value as CommunityVolunteer['status'])
                }
                className="rounded-lg border border-stone-300 bg-white p-1 text-xs dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
