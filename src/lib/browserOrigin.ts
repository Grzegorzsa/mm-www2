import type { NextRequest } from 'next/server'

function getCanonicalOrigin(req: NextRequest): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.NODE_ENV === 'production' ? '' : req.nextUrl.origin)

  return raw.endsWith('/') ? raw.slice(0, -1) : raw
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
  const expectedOrigin = getCanonicalOrigin(req)
  if (!expectedOrigin) return false

  const origin = parseOriginHeader(req.headers.get('origin'))
  if (origin) return origin === expectedOrigin

  const referer = parseOriginHeader(req.headers.get('referer'))
  if (referer) return referer === expectedOrigin

  return false
}
