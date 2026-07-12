/**
 * In-memory sliding-window rate limiter.
 *
 * NOTE: State lives in the Node.js process. Works correctly for single-instance
 * deployments (Docker, single PM2 instance). For multi-instance / serverless
 * deployments, replace with a Redis-backed store (e.g. upstash/ratelimit).
 */

type RateLimiterLogMode = 'all' | 'blocked' | 'summary'

type RateLimitSummaryState = {
  allowed: number
  blocked: number
  startedAt: number
}

const RATE_LIMITER_LOG_ENABLED = process.env.RATE_LIMITER_LOG_ENABLED === 'true'
const RATE_LIMITER_LOG_MODE: RateLimiterLogMode =
  process.env.RATE_LIMITER_LOG_MODE === 'all'
    ? 'all'
    : process.env.RATE_LIMITER_LOG_MODE === 'summary'
      ? 'summary'
      : 'blocked'
const RATE_LIMITER_LOG_SUMMARY_INTERVAL_MS = Math.max(
  1_000,
  Number(process.env.RATE_LIMITER_LOG_SUMMARY_INTERVAL_MS ?? 60_000),
)
const rateLimitSummaryStore = new Map<string, RateLimitSummaryState>()

function redactRateLimitKey(key: string): string {
  if (key.length <= 8) return key
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

function logRateLimitEvent({
  allowed,
  key,
  limiter,
  max,
  totalHits,
  windowMs,
}: {
  allowed: boolean
  key: string
  limiter: string
  max: number
  totalHits: number
  windowMs: number
}) {
  if (!RATE_LIMITER_LOG_ENABLED) return
  if (RATE_LIMITER_LOG_MODE === 'summary') {
    const now = Date.now()
    const summary = rateLimitSummaryStore.get(limiter) ?? {
      allowed: 0,
      blocked: 0,
      startedAt: now,
    }

    if (allowed) {
      summary.allowed += 1
    } else {
      summary.blocked += 1
    }

    const shouldFlush = now - summary.startedAt >= RATE_LIMITER_LOG_SUMMARY_INTERVAL_MS

    if (shouldFlush) {
      if (summary.allowed > 0 || summary.blocked > 0) {
        console.info('[rate-limit-summary]', {
          allowed: summary.allowed,
          blocked: summary.blocked,
          intervalMs: now - summary.startedAt,
          limiter,
        })
      }

      rateLimitSummaryStore.set(limiter, {
        allowed: 0,
        blocked: 0,
        startedAt: now,
      })
      return
    }

    rateLimitSummaryStore.set(limiter, summary)
    return
  }

  if (RATE_LIMITER_LOG_MODE === 'blocked' && allowed) return

  const logger = allowed ? console.info : console.warn
  logger('[rate-limit]', {
    action: allowed ? 'allow' : 'block',
    key: redactRateLimitKey(key),
    limiter,
    max,
    totalHits,
    windowMs,
  })
}

class RateLimiter {
  /** key → array of Unix timestamps (ms) for requests within the window */
  private readonly store = new Map<string, number[]>()

  constructor(
    private readonly name: string,
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
      logRateLimitEvent({
        allowed: false,
        key,
        limiter: this.name,
        max: this.max,
        totalHits: entries.length,
        windowMs: this.windowMs,
      })
      return false
    }

    entries.push(now)
    this.store.set(key, entries)
    logRateLimitEvent({
      allowed: true,
      key,
      limiter: this.name,
      max: this.max,
      totalHits: entries.length,
      windowMs: this.windowMs,
    })
    return true
  }
}

// ---------------------------------------------------------------------------
// Shared limiter instances
// ---------------------------------------------------------------------------

/** Contact form: max 4 submissions per IP per 24 hours */
export const contactLimiter = new RateLimiter('contact', 24 * 60 * 60 * 1000, 4)

/** Login: max 10 attempts per IP per 15 minutes */
export const loginLimiter = new RateLimiter('login', 15 * 60 * 1000, 10)

/** Registration: max 5 accounts created per IP per hour */
export const registerLimiter = new RateLimiter('register', 60 * 60 * 1000, 5)

/** Forgot-password: max 5 requests per IP per hour */
export const forgotPasswordLimiter = new RateLimiter('forgot-password', 60 * 60 * 1000, 5)

/** Reset-password: max 5 requests per IP per hour */
export const resetPasswordLimiter = new RateLimiter('reset-password', 60 * 60 * 1000, 5)

/** JUCE installation endpoint: max 20 requests per IP per 15 minutes */
export const installationLimiter = new RateLimiter('installation', 15 * 60 * 1000, 20)

/** Activation-code preview: max 20 attempts per IP per hour */
export const activationPreviewLimiter = new RateLimiter('activation-preview', 60 * 60 * 1000, 20)

/** Email-domain check: max 30 attempts per IP per hour */
export const emailDomainCheckLimiter = new RateLimiter('email-domain-check', 60 * 60 * 1000, 30)

/** Public checkout creation: max 12 attempts per IP per hour */
export const checkoutPurchaseLimiter = new RateLimiter('checkout-purchase', 60 * 60 * 1000, 12)

/** Upgrade checkout: max 12 attempts per user/IP per hour */
export const checkoutUpgradeLimiter = new RateLimiter('checkout-upgrade', 60 * 60 * 1000, 12)

/** User redeem endpoint: max 20 attempts per user or IP per hour */
export const redeemUserLimiter = new RateLimiter('redeem-user', 60 * 60 * 1000, 20)

/** User panel reads: max 60 requests per user/IP per hour */
export const userPanelLimiter = new RateLimiter('user-panel', 60 * 60 * 1000, 60)

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
