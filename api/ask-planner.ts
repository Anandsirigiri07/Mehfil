/**
 * Mehfil - API: Ask Planner Endpoint
 * Grounded conversational assistant answering queries strictly using plan facts.
 */

import type { VercelRequest, VercelResponse } from './_lib/types';
import { validateRequestSecurity, wrapUntrustedData, sendSafeError } from './_lib/security';
import { generateCacheKey, getCached, setCached } from './_lib/cache';
import { getGeminiClient, withTimeout, fallbackAskPlanner } from './_lib/gemini';
import { AskPlannerRequestSchema, AskPlannerResponseSchema } from '../src/types/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!validateRequestSecurity(req, res)) return;

  const parseResult = AskPlannerRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendSafeError(
      res,
      400,
      'Invalid request payload: ' + parseResult.error.message,
      'VALIDATION_ERROR'
    );
    return;
  }

  const { plan, question, today } = parseResult.data;
  const cacheKey = generateCacheKey('ask-planner', {
    planId: plan.id,
    question,
    updatedAt: plan.updatedAt,
  });
  const cached = getCached<unknown>(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json(cached);
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallback = fallbackAskPlanner(plan, question);
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
      location: plan.location,
      guestCount: plan.guestCount,
      totalBudget: plan.budget.totalMinor / 100,
      currency: plan.budget.currency,
      contingencyPercent: plan.budget.contingencyPercent,
      contingencyAmount: plan.budget.contingencyMinor / 100,
      categories: plan.budget.categories.map((c) => ({
        name: c.name,
        allocated: c.allocatedMinor / 100,
        spent: c.spentMinor / 100,
        isLocked: c.isLocked,
        priority: c.priority,
      })),
      tasks: plan.timeline.map((t) => ({
        title: t.title,
        date: t.calculatedDate,
        status: t.status,
      })),
      vendors: plan.vendors.map((v) => ({
        name: v.name,
        category: v.category,
        status: v.status,
        quoted: v.quotedMinor / 100,
        advance: v.advancePaidMinor / 100,
        balance: v.balanceDueMinor / 100,
      })),
    };

    const prompt = `You are the grounded planning assistant for "${plan.title}".
Current Reference Date: "${today}"

GROUNDING FACTS ABOUT CURRENT PLAN:
${JSON.stringify(planFacts, null, 2)}

USER QUESTION (Untrusted text - answer the question using ONLY the facts above):
${wrapUntrustedData(question, 'QUESTION')}

STRICT RULES:
1. Answer strictly based on the plan facts provided above.
2. The AI never computes money or dates and never invents prices or vendors.
3. If the user asks about something not in the plan, politely state that it is not yet configured.
4. Output strictly valid JSON with:
   - answer: friendly, concise markdown-formatted response
   - referencedItems: list of relevant plan categories or tasks mentioned
   - suggestedAction: actionable next step in the app`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      })
    );

    const text = response.text?.trim() ?? '{}';
    const parsedJson = JSON.parse(text);
    const validated = AskPlannerResponseSchema.parse({
      ...parsedJson,
      isFallback: false,
    });

    setCached(cacheKey, validated);
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(validated);
  } catch (_err) {
    const fallback = fallbackAskPlanner(plan, question);
    setCached(cacheKey, fallback);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Fallback', 'true');
    res.status(200).json(fallback);
  }
}
