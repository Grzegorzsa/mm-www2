import { NextResponse, type NextRequest } from 'next/server'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Slugs kolekcji Payload wystawianych pod /api/:collection
const PAYLOAD_COLLECTION_SLUGS = new Set([
  'admin-users',
  'users',
  'media',
  'pages',
  'orders',
  'contact-submissions',
  'products',
  'product-variants',
  'commerce-offers',
  'discount-codes',
  'activation-code-definitions',
  'activation-codes',
  'banned-domains',
  'banned-emails',
  'licenses',
  'license-transactions',
  'installations',
  'welcome-licenses',
  'affiliates',
])

/**
 * Hardening: disable public GraphQL surfaces in production.
 *
 * Payload-generated GraphQL routes are still available in development,
 * but in production we return 404 to reduce attack surface.
 */
export function proxy(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const pathname = req.nextUrl.pathname
  const method = req.method.toUpperCase()

  if (pathname === '/api/graphql' || pathname === '/api/graphql-playground') {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Hardening: block anonymous write attempts to Payload collection REST routes.
  // Custom application routes (/api/auth/*, /api/checkout/*, /api/webhooks/*, etc.)
  // are unaffected because their first segment is not a collection slug.
  if (WRITE_METHODS.has(method) && pathname.startsWith('/api/')) {
    const firstSegment = pathname.slice('/api/'.length).split('/')[0]

    if (PAYLOAD_COLLECTION_SLUGS.has(firstSegment)) {
      const payloadToken = req.cookies.get('payload-token')?.value
      if (!payloadToken) {
        return new NextResponse('Not Found', { status: 404 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
