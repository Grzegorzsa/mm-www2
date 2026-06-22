import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const GET = async (request: Request) => {
  const payload = await getPayload({
    config: configPromise,
  })

  // Celowe rzucenie wyjątku dla testów Sentry
  throw new Error('Sentry Test Error: Custom API Route Failure')
}
