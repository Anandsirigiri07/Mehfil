/**
 * Mehfil - Serverless In-Memory Response Cache
 * Caches identical AI requests to minimize latency, reduce token consumption,
 * and ensure prompt determinism.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cacheStore = new Map<string, CacheEntry<unknown>>();
const MAX_CACHE_ENTRIES = 100;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a stable deterministic cache key from an endpoint name and payload.
 */
export function generateCacheKey(endpoint: string, payload: unknown): string {
  const serialized = JSON.stringify(payload, Object.keys(payload as object).sort());
  // Simple fast hash
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    hash = (hash << 5) - hash + serialized.charCodeAt(i);
    hash |= 0;
  }
  return `${endpoint}:${hash}`;
}

/**
 * Retrieves a cached response if present and not expired.
 */
export function getCached<T>(key: string): T | null {
  const entry = cacheStore.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Stores a response in the in-memory cache with TTL.
 */
export function setCached<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  // Evict oldest if exceeding max entries
  if (cacheStore.size >= MAX_CACHE_ENTRIES) {
    const firstKey = cacheStore.keys().next().value;
    if (firstKey) cacheStore.delete(firstKey);
  }

  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}
