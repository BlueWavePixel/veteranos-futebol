/**
 * In-memory rate limiter.
 *
 * LIMITATION: In serverless environments each function instance has its own
 * memory, so rate limits are per-instance, not global. With Vercel Fluid
 * Compute, instances are reused across requests which provides partial
 * coverage. For strict global rate limiting, migrate to Upstash Redis.
 *
 * For this project (low traffic, community site), in-memory is sufficient
 * as a first line of defense. Cloudflare Turnstile provides the main
 * anti-abuse protection on public forms.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks in long-lived instances
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

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
  cleanupExpired();
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

const ONE_HOUR = 60 * 60 * 1000;

/** Global auth rate limit: 100 requests per IP per hour across all /api/auth/* routes */
export function checkGlobalAuthLimit(ip: string): RateLimitResult {
  return checkRateLimit(`global-auth:${ip}`, 100, ONE_HOUR);
}

/** Reset all rate limit entries — useful for testing */
export function resetRateLimits(): void {
  store.clear();
}
