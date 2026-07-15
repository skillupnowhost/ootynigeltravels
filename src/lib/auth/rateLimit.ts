const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory fixed-window rate limiter. Single-instance only — fine for a
 * VPS deployment; swap for a shared store (Redis) behind a load balancer.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
