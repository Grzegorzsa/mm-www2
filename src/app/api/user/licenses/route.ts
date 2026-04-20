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

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const licenses = await getUserLicenses(payload, user.id)

  return NextResponse.json(licenses)
}
