import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { h } from '@/lib/h'
import { forgotPasswordLimiter, getClientIp } from '@/lib/rateLimiter'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!forgotPasswordLimiter.check(ip)) {
    // Always return 200 to prevent email enumeration / timing attacks,
    // but silently drop the request when rate-limited.
    return NextResponse.json({ ok: true })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true }) // silent fail
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ ok: true })
  }

  const { email, scs } = body as Record<string, unknown>

  if (typeof email !== 'string') {
    return NextResponse.json({ ok: true })
  }

  // Parity check — invalid scs silently dropped (no 401 to prevent probing)
  if (typeof scs !== 'string' || scs !== h(email)) {
    return NextResponse.json({ ok: true })
  }

  try {
    const payload = await getPayload({ config })
    await payload.forgotPassword({ collection: 'users', data: { email } })
  } catch {
    // Swallow — never leak whether the email exists
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ ok: true })
}
