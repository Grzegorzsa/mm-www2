import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  getEmailDomain,
  isBannedEmailAddress,
  isBannedEmailDomain,
  TEMP_EMAIL_REJECT_MESSAGE,
} from '@/lib/bannedDomains'
import { emailDomainCheckLimiter, getClientIp } from '@/lib/rateLimiter'

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  if (!emailDomainCheckLimiter.check(clientIp)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email } = body as Record<string, unknown>
  if (typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const domain = getEmailDomain(email)
  if (!domain) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const blocked =
    (await isBannedEmailAddress(payload, email)) || (await isBannedEmailDomain(payload, email))

  if (blocked) {
    return NextResponse.json(
      {
        allowed: false,
        error: TEMP_EMAIL_REJECT_MESSAGE,
      },
      { status: 200 },
    )
  }

  return NextResponse.json({ allowed: true, domain }, { status: 200 })
}
