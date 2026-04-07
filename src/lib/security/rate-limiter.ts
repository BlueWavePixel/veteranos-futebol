type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Expired or no entry — start fresh
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxAttempts - 1, resetAt };
  }

  // Under limit
  if (entry.count < maxAttempts) {
    entry.count++;
    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Over limit
  return { allowed: false, remaining: 0, resetAt: entry.resetAt };
}

/** Reset all rate limit entries — useful for testing */
export function resetRateLimits(): void {
  store.clear();
}
