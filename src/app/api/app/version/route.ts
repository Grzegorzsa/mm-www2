/**
 * GET /api/app/version?uid=mx-grid
 *
 * Returns the current version of a product by uid.
 *
 * Query params:
 *   uid - Product unique identifier (e.g. "mx-grid")
 *
 * Response (application/json):
 *   {
 *     uid: string
 *     version: string   // version string (e.g. "2.1.0")
 *     versionNo: number // numeric version
 *   }
 */
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')

  if (!uid) {
    return Response.json({ error: 'Missing required parameter: uid' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'products',
    where: { uid: { equals: uid } },
    limit: 1,
    depth: 0,
  })

  if (!docs.length) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }

  const product = docs[0]

  return Response.json({
    uid: product.uid,
    version: product.version,
    versionNo: product.versionNo,
  })
}
