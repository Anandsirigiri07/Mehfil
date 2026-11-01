/**
 * Mehfil - API: Suggest Ideas Endpoint
 * Generates personalized creative celebration ideas, activities, and budget tips.
 */

import type { VercelRequest, VercelResponse } from './_lib/types';
import { validateRequestSecurity, wrapUntrustedData, sendSafeError } from './_lib/security';
import { generateCacheKey, getCached, setCached } from './_lib/cache';
import { getGeminiClient, withTimeout, fallbackSuggestIdeas } from './_lib/gemini';
import { SuggestIdeasRequestSchema, SuggestIdeasResponseSchema } from '../src/types/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!validateRequestSecurity(req, res)) return;

  const parseResult = SuggestIdeasRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendSafeError(
      res,
      400,
      'Invalid request payload: ' + parseResult.error.message,
      'VALIDATION_ERROR'
    );
    return;
  }

  const { occasion, guestCount, totalBudgetMinor, currency, location, themePreference } =
    parseResult.data;
  const cacheKey = generateCacheKey('suggest-ideas', parseResult.data);
  const cached = getCached<unknown>(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json(cached);
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallback = fallbackSuggestIdeas(occasion, location);
    setCached(cacheKey, fallback);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Fallback', 'true');
    res.status(200).json(fallback);
    return;
  }

  try {
    const prompt = `You are a creative celebration designer for Mehfil.
Occasion: ${occasion}
Location: ${location}
Headcount: ${guestCount} guests
Budget: ${totalBudgetMinor / 100} ${currency}
Theme preference: ${themePreference ? wrapUntrustedData(themePreference, 'THEME_PREFERENCE') : 'Default cultural/modern fusion'}

Provide personalized ideas:
- theme: a distinctive, cohesive event theme title
- ideas: array of 3 to 4 items with category (decor, catering, entertainment, activities), title, description, budgetTip, and optional diyAlternative.
- proTips: array of 2 practical logistical tips for ${occasion} in ${location}.

IMPORTANT:
- Ground all suggestions in the occasion and location.
- Do NOT compute arbitrary line-item figures or invent specific commercial vendors.
- Output strictly valid JSON matching the schema.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      })
    );

    const text = response.text?.trim() ?? '{}';
    const parsedJson = JSON.parse(text);
    const validated = SuggestIdeasResponseSchema.parse({
      ...parsedJson,
      isFallback: false,
    });

    setCached(cacheKey, validated);
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(validated);
  } catch (_err) {
    const fallback = fallbackSuggestIdeas(occasion, location);
    setCached(cacheKey, fallback);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Fallback', 'true');
    res.status(200).json(fallback);
  }
}
