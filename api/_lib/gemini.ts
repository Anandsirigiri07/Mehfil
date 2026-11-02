/**
 * Mehfil - Serverless Gemini Client & Failover Controller
 * Server-side execution only with strict timeouts and schema constraints.
 * Core rule: The AI never computes money or dates and never invents prices or vendors.
 */

import { GoogleGenAI } from '@google/genai';

export * from './fallbacks';

const API_TIMEOUT_MS = 8000;
const CANDIDATE_MODELS = ['gemini-flash-lite-latest', 'gemini-3.6-flash', 'gemini-3.5-flash'];

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Executes an async task with strict serverless timeout.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = API_TIMEOUT_MS
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Generates content starting with primary gemini-3.6-flash, failing over to 3.8/3.5 on transient errors.
 */
export async function generateContentWithFailover(
  ai: GoogleGenAI,
  prompt: string,
  config?: { responseMimeType?: string; temperature?: number }
) {
  let lastError: unknown;
  for (const model of CANDIDATE_MODELS) {
    try {
      return await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config,
        }),
        API_TIMEOUT_MS
      );
    } catch (err: unknown) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('ALL_MODELS_FAILED');
}
