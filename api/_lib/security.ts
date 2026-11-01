/**
 * Mehfil - Serverless Security Utilities
 * Enforces strict HTTP methods, JSON content types, body size limits,
 * origin checks, rate limiting, and prompt-injection sanitization.
 */

import type { VercelRequest, VercelResponse } from './types';

const MAX_BODY_BYTES = 32768; // 32 KB body limit
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 req/min per IP

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory per-IP rate limit store
const ipStore = new Map<string, RateLimitRecord>();

/**
 * Strips prompt-injection vectors and control tags from untrusted user text.
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/<<</g, '')
    .replace(/>>>/g, '')
    .replace(/\[INST\]|\[\/INST\]/gi, '')
    .trim();
}

/**
 * Wraps user input into structured prompt delimiters explicitly declaring it as raw data.
 */
export function wrapUntrustedData(input: string, label: string = 'USER_INPUT'): string {
  const sanitized = sanitizeUserInput(input);
  return `<<<START_${label}>>>\n${sanitized}\n<<<END_${label}>>>`;
}

/**
 * Safely parses request body whether it arrived as an object or raw JSON string.
 */
export function parseBodyPayload<T = unknown>(body: unknown): T {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T;
    } catch {
      return body as T;
    }
  }
  return body as T;
}

/**
 * Validates request security headers, body size, rate limits, and origin.
 * Returns true if allowed, false if response has already been sent with an error.
 */
export function validateRequestSecurity(req: VercelRequest, res: VercelResponse): boolean {
  // 1. Only POST allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({
      error: 'Method Not Allowed. Only POST requests are permitted.',
      code: 'METHOD_NOT_ALLOWED',
    });
    return false;
  }

  // 2. Must be application/json
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    res.status(415).json({
      error: 'Unsupported Media Type. Expected Content-Type: application/json.',
      code: 'UNSUPPORTED_MEDIA_TYPE',
    });
    return false;
  }

  // 3. Body size verification (checked against length or payload size)
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    res.status(413).json({
      error: 'Payload Too Large. Request body exceeds 32 KB limit.',
      code: 'PAYLOAD_TOO_LARGE',
    });
    return false;
  }

  // 4. Same-origin or allowed origin check
  const origin = req.headers['origin'] ?? req.headers['referer'];
  const host =
    (req.headers['x-forwarded-host'] as string | undefined) ??
    (req.headers['host'] as string | undefined);

  if (origin && host) {
    try {
      const originHost = new URL(origin as string).host.replace(/:\d+$/, '');
      const currentHost = host.split(',')[0]?.trim().replace(/:\d+$/, '') ?? '';

      const isLocalhost = originHost.includes('localhost') || originHost.includes('127.0.0.1');
      const isSameHost = originHost === currentHost;
      const isVercel = originHost.endsWith('.vercel.app') && currentHost.endsWith('.vercel.app');

      if (!isSameHost && !isLocalhost && !isVercel) {
        res.status(403).json({
          error: 'Forbidden. Cross-origin request blocked.',
          code: 'ORIGIN_MISMATCH',
        });
        return false;
      }
    } catch {
      res.status(400).json({
        error: 'Bad Request. Malformed origin header.',
        code: 'INVALID_ORIGIN_HEADER',
      });
      return false;
    }
  }

  // 5. Per-IP Rate Limiting
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp =
    typeof forwarded === 'string'
      ? (forwarded.split(',')[0]?.trim() ?? '127.0.0.1')
      : (req.socket?.remoteAddress ?? '127.0.0.1');

  const now = Date.now();
  const record = ipStore.get(clientIp);

  if (!record || record.resetAt <= now) {
    ipStore.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count++;
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'Too Many Requests. Rate limit exceeded. Please try again shortly.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return false;
    }
  }

  return true;
}

/**
 * Sends a sanitized error response without leaking stack traces or internal environment variables.
 */
export function sendSafeError(
  res: VercelResponse,
  statusCode: number,
  message: string,
  code: string = 'INTERNAL_ERROR'
): void {
  res.status(statusCode).json({
    error: message,
    code,
  });
}
