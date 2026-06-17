# Integracja platformy z Sentry do analizy błędów

Instrukcje od Sentry:

1. Install Sentry: npx @sentry/wizard@latest -i nextjs --saas --org gssoftpl --project mxbeats-www
2. Configure Sentry
   import \* as Sentry from "@sentry/nextjs";

Sentry.init({
dsn: "https://281a1893955005ce3796f6ed484016d1@o1084220.ingest.us.sentry.io/4511303344521216",

// Set tracesSampleRate to 1.0 to capture 100%
// of transactions for performance monitoring.
// We recommend adjusting this value in production
tracesSampleRate: 1.0,
});

3. Add Distributed Tracing (Optional)

// instrumentation-client.(js|ts)
Sentry.init({
dsn: "https://281a1893955005ce3796f6ed484016d1@o1084220.ingest.us.sentry.io/4511303344521216",
integrations: [Sentry.browserTracingIntegration()],
tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/]
});
