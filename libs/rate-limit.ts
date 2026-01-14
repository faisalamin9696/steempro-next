// lib/rate-limit.ts
interface RateLimitEntry {
  count: number;
  firstSeen: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Clean up old entries every hour
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.limits.entries()) {
        if (now - entry.firstSeen > 24 * 60 * 60 * 1000) {
          // 24 hours
          this.limits.delete(key);
        }
      }
    }, 60 * 60 * 1000);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // First request
      this.limits.set(key, { count: 1, firstSeen: now });
      return false; // Not rate limited
    }

    if (now - entry.firstSeen > windowMs) {
      // Window expired, reset
      this.limits.set(key, { count: 1, firstSeen: now });
      return false;
    }

    if (entry.count >= limit) {
      // Rate limited
      return true;
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);
    return false;
  }

  cleanup() {
    clearInterval(this.cleanupInterval);
  }
}

export const rateLimiter = RateLimiter.getInstance();
