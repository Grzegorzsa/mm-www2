const DEFAULT_ORIGINS = ['https://mxbeats.com', 'https://www.mxbeats.com']

function normalizeOrigin(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function configuredOrigins(): Set<string> {
  const values = [
    process.env.NEXT_PUBLIC_SERVER_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    ...DEFAULT_ORIGINS,
  ]

  const origins = new Set<string>()

  for (const value of values) {
    if (!value) continue

    try {
      origins.add(normalizeOrigin(new URL(value).origin))
    } catch {
      // Ignore malformed env values and continue with defaults.
    }
  }

  return origins
}

function isRelativePath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//')
}

export function normalizeMediaUrl(value: string): string {
  if (!value) return value
  if (isRelativePath(value)) return value

  try {
    const parsed = new URL(value)
    const origin = normalizeOrigin(parsed.origin)

    // If media URL points to our own site, use a relative path to keep
    // Next.js image optimizer on the local fetch path and avoid SSRF/private IP guard.
    if (configuredOrigins().has(origin)) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }
  } catch {
    // Keep the original value when not a valid absolute URL.
  }

  return value
}
