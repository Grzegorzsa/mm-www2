import type { NextRequest } from 'next/server'

function normalizeOrigin(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function getAdditionalAllowedOrigins(): string[] {
  const raw =
    process.env.TRUSTED_BROWSER_ORIGINS || process.env.NEXT_PUBLIC_TRUSTED_BROWSER_ORIGINS || ''

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return normalizeOrigin(new URL(value).origin)
      } catch {
        return null
      }
    })
    .filter((value): value is string => Boolean(value))
}

function getCanonicalOrigin(req: NextRequest): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.NODE_ENV === 'production' ? '' : req.nextUrl.origin)

  return normalizeOrigin(raw)
}

function parseOriginHeader(value: string | null): string | null {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function isTrustedBrowserOrigin(req: NextRequest): boolean {
  const allowedOrigins = new Set<string>()
  const expectedOrigin = getCanonicalOrigin(req)
  if (expectedOrigin) allowedOrigins.add(expectedOrigin)

  for (const origin of getAdditionalAllowedOrigins()) {
    allowedOrigins.add(origin)
  }

  // Local development safety valve: if the request itself targets localhost,
  // allow matching localhost origin even when canonical URL points to production.
  if (isLocalHostname(req.nextUrl.hostname)) {
    allowedOrigins.add(normalizeOrigin(req.nextUrl.origin))
  }

  if (allowedOrigins.size === 0) return false

  const origin = parseOriginHeader(req.headers.get('origin'))
  if (origin) return allowedOrigins.has(normalizeOrigin(origin))

  const referer = parseOriginHeader(req.headers.get('referer'))
  if (referer) return allowedOrigins.has(normalizeOrigin(referer))

  return false
}
