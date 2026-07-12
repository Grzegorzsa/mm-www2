/**
 * GET /api/user/installations
 *
 * Returns the authenticated user's active installations (for the user panel).
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getInstallationsByUserId } from '@/lib/installationsHelper'
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
  const installations = await getInstallationsByUserId(payload, user.id)

  return NextResponse.json(installations)
}
