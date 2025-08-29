/**
 * Simple rate limiter for API requests
 * Prevents overwhelming external routing services
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is allowed
   */
  async isAllowed(key: string): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Filter out old requests
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    // Update stored requests
    this.requests.set(key, recentRequests);

    // Check if we can make another request
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Record this request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Wait until next request is allowed
   */
  async waitUntilAllowed(key: string): Promise<void> {
    while (!(await this.isAllowed(key))) {
      // Wait for the minimum interval
      const minWait = Math.ceil(this.windowMs / this.maxRequests);
      await new Promise((resolve) => setTimeout(resolve, minWait));
    }
  }

  /**
   * Get time until next request is allowed (in ms)
   */
  getTimeUntilReset(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + this.windowMs;
    const now = Date.now();

    return Math.max(0, resetTime - now);
  }

  /**
   * Get current usage for a key
   */
  getCurrentUsage(key: string): {
    current: number;
    limit: number;
    resetIn: number;
  } {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    return {
      current: recentRequests.length,
      limit: this.maxRequests,
      resetIn: this.getTimeUntilReset(key),
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.requests.clear();
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(
        (timestamp) => now - timestamp < this.windowMs
      );

      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }
}

/**
 * Pre-configured rate limiters for different services
 */
export const rateLimiters = {
  mapbox: new RateLimiter(600, 60000), // 600 requests per minute
  google: new RateLimiter(50, 1000), // 50 requests per second
  here: new RateLimiter(1000, 60000), // 1000 requests per minute
  local: new RateLimiter(Infinity, 1), // No limit for local service
};

/**
 * Decorator for rate-limited methods
 */
export function RateLimit(service: keyof typeof rateLimiters) {
  return function (
    target: object,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const rateLimiter = rateLimiters[service];
      const key = `${this.constructor.name}:${propertyName}`;

      // Wait until request is allowed
      await rateLimiter.waitUntilAllowed(key);

      // Call original method
      return method.apply(this, args);
    };

    return descriptor;
  };
}
