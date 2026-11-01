import { z } from 'zod';

export const OccasionTypeSchema = z.enum(['wedding', 'birthday', 'community', 'milestone']);

export const PriorityLevelSchema = z.enum(['essential', 'desired', 'luxury']);

export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'delayed']);

export const VendorStatusSchema = z.enum([
  'not_started',
  'contacted',
  'quoted',
  'booked',
  'completed',
]);

export const RSVPStatusSchema = z.enum(['yes', 'no', 'maybe']);

export const DietaryRequirementSchema = z.enum([
  'veg',
  'vegan',
  'jain',
  'halal',
  'nut_free',
  'gluten_free',
]);

export const CategoryBudgetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  baseWeight: z.number().min(0).max(100),
  allocatedMinor: z.number().int().min(0),
  spentMinor: z.number().int().min(0),
  isLocked: z.boolean(),
  priority: PriorityLevelSchema,
});

export const BudgetPlanSchema = z.object({
  totalMinor: z.number().int().positive(),
  currency: z.string().min(1).max(10),
  contingencyPercent: z.number().min(0).max(30),
  contingencyMinor: z.number().int().min(0),
  categories: z.array(CategoryBudgetSchema),
});

export const TimelineTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  category: z.string().min(1),
  offsetDaysBeforeEvent: z.number().int(),
  calculatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dependsOn: z.array(z.string()),
  status: TaskStatusSchema,
  delayDays: z.number().int(),
  isMilestone: z.boolean().optional(),
});

export const VendorPaymentSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  name: z.string().min(1).max(100),
  status: VendorStatusSchema,
  quotedMinor: z.number().int().min(0),
  advancePaidMinor: z.number().int().min(0),
  balanceDueMinor: z.number().int().min(0),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  notes: z.string().max(500).optional(),
});

export const GuestRSVPSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  status: RSVPStatusSchema,
  dietary: z.array(DietaryRequirementSchema),
  plusOnes: z.number().int().min(0).max(10),
});

export const CommunityVolunteerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  shift: z.string().min(1).max(50),
  status: z.enum(['confirmed', 'pending', 'completed']),
});

export const CommunityPermitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  authority: z.string().min(1).max(100),
  status: z.enum(['required', 'submitted', 'approved', 'rejected']),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const CommunitySponsorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  tier: z.string().min(1).max(50),
  committedMinor: z.number().int().min(0),
  receivedMinor: z.number().int().min(0),
});

export const MehfilPlanSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  occasion: OccasionTypeSchema,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().min(1).max(120),
  guestCount: z.number().int().positive(),
  budget: BudgetPlanSchema,
  timeline: z.array(TimelineTaskSchema),
  vendors: z.array(VendorPaymentSchema),
  rsvps: z.array(GuestRSVPSchema),
  volunteers: z.array(CommunityVolunteerSchema),
  permits: z.array(CommunityPermitSchema),
  sponsors: z.array(CommunitySponsorSchema),
  notes: z.string().max(2000),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// API Schemas
export const ParseIntakeRequestSchema = z.object({
  description: z.string().min(5).max(1500),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const ParsedIntakeResponseSchema = z.object({
  title: z.string(),
  occasion: OccasionTypeSchema,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string(),
  guestCount: z.number().int().positive(),
  totalBudgetMinor: z.number().int().positive(),
  currency: z.string(),
  specialRequirements: z.array(z.string()).optional(),
  isFallback: z.boolean().optional(),
});

export const SuggestIdeasRequestSchema = z.object({
  occasion: OccasionTypeSchema,
  guestCount: z.number().int().positive(),
  totalBudgetMinor: z.number().int().positive(),
  currency: z.string(),
  location: z.string(),
  themePreference: z.string().max(200).optional(),
});

export const PersonalizedIdeaSchema = z.object({
  category: z.string(),
  title: z.string(),
  description: z.string(),
  budgetTip: z.string(),
  diyAlternative: z.string().optional(),
});

export const SuggestIdeasResponseSchema = z.object({
  theme: z.string(),
  ideas: z.array(PersonalizedIdeaSchema),
  proTips: z.array(z.string()),
  isFallback: z.boolean().optional(),
});

export const ReviewPlanRequestSchema = z.object({
  plan: MehfilPlanSchema,
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const PlanReviewItemSchema = z.object({
  severity: z.enum(['critical', 'warning', 'tip']),
  area: z.string(),
  message: z.string(),
  actionableRecommendation: z.string(),
});

export const ReviewPlanResponseSchema = z.object({
  overallHealthScore: z.number().int().min(0).max(100),
  summary: z.string(),
  findings: z.array(PlanReviewItemSchema),
  isFallback: z.boolean().optional(),
});

export const AskPlannerRequestSchema = z.object({
  plan: MehfilPlanSchema,
  question: z.string().min(2).max(500),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const AskPlannerResponseSchema = z.object({
  answer: z.string(),
  referencedItems: z.array(z.string()).optional(),
  suggestedAction: z.string().optional(),
  isFallback: z.boolean().optional(),
});
