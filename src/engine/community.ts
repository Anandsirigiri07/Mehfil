/**
 * Mehfil - Community Event Engine
 * Volunteer roster, shift management, permit tracking, and sponsor funding.
 */

import type { CommunityPermit, CommunitySponsor, CommunityVolunteer } from '../types';

export interface CommunitySummary {
  readonly totalVolunteers: number;
  readonly confirmedVolunteers: number;
  readonly pendingVolunteers: number;
  readonly totalPermits: number;
  readonly approvedPermits: number;
  readonly pendingPermits: number;
  readonly totalSponsorshipCommittedMinor: number;
  readonly totalSponsorshipReceivedMinor: number;
  readonly sponsorshipFundingGapMinor: number;
}

/**
 * Calculates community event operational metrics deterministically.
 */
export function calculateCommunitySummary(
  volunteers: readonly CommunityVolunteer[],
  permits: readonly CommunityPermit[],
  sponsors: readonly CommunitySponsor[]
): CommunitySummary {
  let confirmedVolunteers = 0;
  let pendingVolunteers = 0;

  for (const vol of volunteers) {
    if (vol.status === 'confirmed' || vol.status === 'completed') {
      confirmedVolunteers++;
    } else {
      pendingVolunteers++;
    }
  }

  let approvedPermits = 0;
  let pendingPermits = 0;

  for (const permit of permits) {
    if (permit.status === 'approved') {
      approvedPermits++;
    } else {
      pendingPermits++;
    }
  }

  let totalCommitted = 0;
  let totalReceived = 0;

  for (const sponsor of sponsors) {
    totalCommitted += sponsor.committedMinor;
    totalReceived += sponsor.receivedMinor;
  }

  const fundingGap = Math.max(0, totalCommitted - totalReceived);

  return {
    totalVolunteers: volunteers.length,
    confirmedVolunteers,
    pendingVolunteers,
    totalPermits: permits.length,
    approvedPermits,
    pendingPermits,
    totalSponsorshipCommittedMinor: totalCommitted,
    totalSponsorshipReceivedMinor: totalReceived,
    sponsorshipFundingGapMinor: fundingGap,
  };
}

/**
 * Generates default sample community items for initialization.
 */
export function generateSampleCommunityData(): {
  volunteers: CommunityVolunteer[];
  permits: CommunityPermit[];
  sponsors: CommunitySponsor[];
} {
  return {
    volunteers: [
      {
        id: 'vol-1',
        name: 'Kavita Rao',
        role: 'Main Gate & Guest Check-in',
        shift: '09:00 - 13:00',
        status: 'confirmed',
      },
      {
        id: 'vol-2',
        name: 'Arjun Verma',
        role: 'Audio & Stage Assistant',
        shift: '10:00 - 16:00',
        status: 'confirmed',
      },
      {
        id: 'vol-3',
        name: 'Sunita Patil',
        role: 'Refreshments & Water Booth',
        shift: '12:00 - 16:00',
        status: 'pending',
      },
      {
        id: 'vol-4',
        name: 'Deepak Joshi',
        role: 'Cleanliness & Waste Marshall',
        shift: '15:00 - 19:00',
        status: 'confirmed',
      },
    ],
    permits: [
      {
        id: 'per-1',
        name: 'Public Ground Loudspeaker Permission',
        authority: 'City Police Commissionerate',
        status: 'approved',
        deadline: '2026-11-15',
      },
      {
        id: 'per-2',
        name: 'Fire Safety & Electrical Clearance',
        authority: 'Fire Department',
        status: 'submitted',
        deadline: '2026-11-18',
      },
      {
        id: 'per-3',
        name: 'Waste Disposal & Sanitation Permit',
        authority: 'Municipal Corporation (BBMP)',
        status: 'required',
        deadline: '2026-11-20',
      },
    ],
    sponsors: [
      {
        id: 'spon-1',
        name: 'Bengaluru Tech Association',
        tier: 'Title Sponsor',
        committedMinor: 5000000,
        receivedMinor: 5000000,
      },
      {
        id: 'spon-2',
        name: 'GreenRoots Organics',
        tier: 'Refreshment Partner',
        committedMinor: 2500000,
        receivedMinor: 1500000,
      },
      {
        id: 'spon-3',
        name: 'Apex Logistics',
        tier: 'Community Supporter',
        committedMinor: 1000000,
        receivedMinor: 0,
      },
    ],
  };
}
