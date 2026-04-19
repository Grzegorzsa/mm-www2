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

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const installations = await getInstallationsByUserId(payload, user.id)

  return NextResponse.json(installations)
}
