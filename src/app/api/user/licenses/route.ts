/**
 * GET /api/user/licenses
 *
 * Returns the authenticated user's licenses (for the user panel).
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getUserLicenses } from '@/lib/licenseHelper'
import { getClientIp, userPanelLimiter } from '@/lib/rateLimiter'

export async function GET(req: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientIp = getClientIp(req)
  if (!userPanelLimiter.check(`${user.id}:${clientIp}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const payload = await getPayload({ config })
  const licenses = await getUserLicenses(payload, user.id)

  return NextResponse.json(licenses)
}
