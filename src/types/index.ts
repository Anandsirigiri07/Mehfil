/**
 * Mehfil - Core Domain Types
 * Strict TypeScript types for the event planning engine.
 * All monetary amounts are integers in minor units (paise/cents).
 */

export type OccasionType = 'wedding' | 'birthday' | 'community' | 'milestone';

export type PriorityLevel = 'essential' | 'desired' | 'luxury';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export type VendorStatus = 'not_started' | 'contacted' | 'quoted' | 'booked' | 'completed';

export type RSVPStatus = 'yes' | 'no' | 'maybe';

export type DietaryRequirement = 'veg' | 'vegan' | 'jain' | 'halal' | 'nut_free' | 'gluten_free';

export interface CategoryBudget {
  readonly id: string;
  readonly name: string;
  readonly baseWeight: number; // percentage integer or float (0-100)
  readonly allocatedMinor: number; // integer minor units
  readonly spentMinor: number; // integer minor units
  readonly isLocked: boolean;
  readonly priority: PriorityLevel;
}

export interface BudgetPlan {
  readonly totalMinor: number; // integer minor units
  readonly currency: string;
  readonly contingencyPercent: number; // e.g. 5 or 10
  readonly contingencyMinor: number;
  readonly categories: readonly CategoryBudget[];
}

export interface TimelineTask {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly offsetDaysBeforeEvent: number; // positive = days before event, 0 = event day
  readonly calculatedDate: string; // ISO YYYY-MM-DD
  readonly dependsOn: readonly string[]; // IDs of preceding tasks
  readonly status: TaskStatus;
  readonly delayDays: number;
  readonly isMilestone?: boolean;
}

export interface VendorPayment {
  readonly id: string;
  readonly category: string;
  readonly name: string;
  readonly status: VendorStatus;
  readonly quotedMinor: number;
  readonly advancePaidMinor: number;
  readonly balanceDueMinor: number;
  readonly dueDate?: string;
  readonly notes?: string;
}

export interface GuestRSVP {
  readonly id: string;
  readonly name: string;
  readonly status: RSVPStatus;
  readonly dietary: readonly DietaryRequirement[];
  readonly plusOnes: number;
}

export interface CommunityVolunteer {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly shift: string;
  readonly status: 'confirmed' | 'pending' | 'completed';
}

export interface CommunityPermit {
  readonly id: string;
  readonly name: string;
  readonly authority: string;
  readonly status: 'required' | 'submitted' | 'approved' | 'rejected';
  readonly deadline: string;
}

export interface CommunitySponsor {
  readonly id: string;
  readonly name: string;
  readonly tier: string;
  readonly committedMinor: number;
  readonly receivedMinor: number;
}

export interface PlanScenario {
  readonly scenarioId: string;
  readonly scenarioName: string;
  readonly plan: MehfilPlan;
}

export interface MehfilPlan {
  readonly id: string;
  readonly title: string;
  readonly occasion: OccasionType;
  readonly eventDate: string; // ISO YYYY-MM-DD
  readonly location: string;
  readonly guestCount: number;
  readonly budget: BudgetPlan;
  readonly timeline: readonly TimelineTask[];
  readonly vendors: readonly VendorPayment[];
  readonly rsvps: readonly GuestRSVP[];
  readonly volunteers: readonly CommunityVolunteer[];
  readonly permits: readonly CommunityPermit[];
  readonly sponsors: readonly CommunitySponsor[];
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
