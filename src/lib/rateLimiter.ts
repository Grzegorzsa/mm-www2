/**
 * In-memory sliding-window rate limiter.
 *
 * NOTE: State lives in the Node.js process. Works correctly for single-instance
 * deployments (Docker, single PM2 instance). For multi-instance / serverless
 * deployments, replace with a Redis-backed store (e.g. upstash/ratelimit).
 */

class RateLimiter {
  /** key → array of Unix timestamps (ms) for requests within the window */
  private readonly store = new Map<string, number[]>()

  constructor(
    private readonly windowMs: number,
    private readonly max: number,
  ) {}

  /**
   * Returns true if the request is allowed.
   * Returns false (and does NOT record the attempt) if the limit is exceeded.
   * Stale entries are pruned on every check — no separate cleanup needed.
   */
  check(key: string): boolean {
    const now = Date.now()
    const cutoff = now - this.windowMs
    const prev = this.store.get(key) ?? []
    const entries = prev.filter((ts) => ts > cutoff)

    if (entries.length >= this.max) {
      this.store.set(key, entries)
      return false
    }

    entries.push(now)
    this.store.set(key, entries)
    return true
  }
}

// ---------------------------------------------------------------------------
// Shared limiter instances
// ---------------------------------------------------------------------------

/** Contact form: max 4 submissions per IP per 24 hours */
export const contactLimiter = new RateLimiter(24 * 60 * 60 * 1000, 4)

/** Login: max 10 attempts per IP per 15 minutes */
export const loginLimiter = new RateLimiter(15 * 60 * 1000, 10)

/** Registration: max 5 accounts created per IP per hour */
export const registerLimiter = new RateLimiter(60 * 60 * 1000, 5)

/** Forgot-password: max 5 requests per IP per hour */
export const forgotPasswordLimiter = new RateLimiter(60 * 60 * 1000, 5)

/** Reset-password: max 5 requests per IP per hour */
export const resetPasswordLimiter = new RateLimiter(60 * 60 * 1000, 5)

/** JUCE installation endpoint: max 20 requests per IP per 15 minutes */
export const installationLimiter = new RateLimiter(15 * 60 * 1000, 20)

// ---------------------------------------------------------------------------
// Helper: extract client IP from Next.js request headers
// ---------------------------------------------------------------------------

/**
 * Returns the real client IP, preferring `x-forwarded-for` (set by reverse
 * proxies / CDNs such as nginx, Vercel, Cloudflare) then `x-real-ip`.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
