type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const MAX_TRACKED_KEYS = 10_000;
const globalRateLimit = globalThis as typeof globalThis & {
  __localPagesRateLimitStore?: RateLimitStore;
};

const store =
  globalRateLimit.__localPagesRateLimitStore ||
  (globalRateLimit.__localPagesRateLimitStore = new Map());

const pruneStore = (now: number) => {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }

  while (store.size > MAX_TRACKED_KEYS) {
    const oldestKey = store.keys().next().value;
    if (!oldestKey) break;
    store.delete(oldestKey);
  }
};

export const getRequestClientIp = (request: Request) =>
  request.headers.get('cf-connecting-ip')?.trim() ||
  request.headers.get('x-real-ip')?.trim() ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  'unknown';

export const consumeRateLimit = (
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
) => {
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    if (store.size >= MAX_TRACKED_KEYS) pruneStore(now);
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(limit - existing.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
  };
};
