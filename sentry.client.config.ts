import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',

  // Errors only — no performance tracing
  tracesSampleRate: 0,

  // No session replays
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  debug: false,
})
