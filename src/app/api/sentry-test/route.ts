export const GET = async (request: Request) => {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 })
  }

  // Intentional exception for Sentry testing in non-production environments.
  throw new Error('Sentry Test Error: Custom API Route Failure')
}
