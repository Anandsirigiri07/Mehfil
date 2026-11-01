/**
 * Mehfil - API: Review Plan Endpoint
 * Performs sanity checks, risk identification, and actionable health assessments on a plan.
 */

import type { VercelRequest, VercelResponse } from './_lib/types';
import {
  validateRequestSecurity,
  wrapUntrustedData,
  sendSafeError,
  parseBodyPayload,
} from './_lib/security';
import { generateCacheKey, getCached, setCached } from './_lib/cache';
import { getGeminiClient, generateContentWithFailover, fallbackReviewPlan } from './_lib/gemini';
import { ReviewPlanRequestSchema, ReviewPlanResponseSchema } from '../src/types/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!validateRequestSecurity(req, res)) return;

  const payload = parseBodyPayload(req.body);
  const parseResult = ReviewPlanRequestSchema.safeParse(payload);
  if (!parseResult.success) {
    sendSafeError(
      res,
      400,
      'Invalid request payload: ' + parseResult.error.message,
      'VALIDATION_ERROR'
    );
    return;
  }

  const { plan, today } = parseResult.data;
  const cacheKey = generateCacheKey('review-plan', {
    planId: plan.id,
    updatedAt: plan.updatedAt,
    today,
  });
  const cached = getCached<unknown>(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json(cached);
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallback = fallbackReviewPlan(plan, today);
    setCached(cacheKey, fallback);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Fallback', 'true');
    res.status(200).json(fallback);
    return;
  }

  try {
    const planFacts = {
      title: plan.title,
      occasion: plan.occasion,
      eventDate: plan.eventDate,
      guestCount: plan.guestCount,
      totalBudget: plan.budget.totalMinor / 100,
      currency: plan.budget.currency,
      contingencyPercent: plan.budget.contingencyPercent,
      categoriesCount: plan.budget.categories.length,
      tasksCount: plan.timeline.length,
      vendorsCount: plan.vendors.length,
      unbookedVendors: plan.vendors.filter((v) => v.status === 'not_started').length,
    };

    const prompt = `You are a master celebration review auditor for Mehfil.
Current Reference Date: "${today}"
Plan summary facts:
${wrapUntrustedData(JSON.stringify(planFacts, null, 2), 'PLAN_FACTS')}

Review this plan for logistical risks, timing bottlenecks, and budget allocation health:
- overallHealthScore: integer between 0 and 100 representing plan preparedness
- summary: concise executive assessment of the celebration readiness
- findings: array of 3 to 5 observations with:
  - severity: 'critical' | 'warning' | 'tip'
  - area: 'Timeline' | 'Budget' | 'Vendors' | 'Guest Experience'
  - message: concise statement of the observation
  - actionableRecommendation: specific advice the planner can execute right away

IMPORTANT:
- Ground recommendations strictly in the factual data provided above.
- The AI never calculates money or dates and never invents prices or vendors.
- Output strictly valid JSON matching the schema.`;

    const response = await generateContentWithFailover(ai, prompt, {
      responseMimeType: 'application/json',
      temperature: 0.2,
    });

    const text = response.text?.trim() ?? '{}';
    const parsedJson = JSON.parse(text);
    const validated = ReviewPlanResponseSchema.parse({
      ...parsedJson,
      isFallback: false,
    });

    setCached(cacheKey, validated);
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(validated);
  } catch {
    const fallback = fallbackReviewPlan(plan, today);
    setCached(cacheKey, fallback);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Fallback', 'true');
    res.status(200).json(fallback);
  }
}
