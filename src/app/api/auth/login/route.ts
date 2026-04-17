import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { h } from '@/lib/h'
import { loginLimiter, getClientIp } from '@/lib/rateLimiter'

export async function POST(req: NextRequest) {
  // Rate-limit by IP before doing any work
  const ip = getClientIp(req)
  if (!loginLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 },
    )
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

  const { email, password, scs } = body as Record<string, unknown>

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Parity check — rejects automated requests that bypassed the form
  if (typeof scs !== 'string' || scs !== h(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const result = await payload.login({ collection: 'users', data: { email, password } })

    if (!result.token) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const response = NextResponse.json({
      user: result.user,
      token: result.token,
      exp: result.exp,
    })

    // Mirror the cookie that Payload's REST layer would normally set
    const expDate =
      typeof result.exp === 'number'
        ? new Date(result.exp * 1000)
        : new Date(Date.now() + 2 * 60 * 60 * 1000)

    response.cookies.set('payload-token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: expDate,
    })

    return response
  } catch (err: unknown) {
    // Use a generic message — don't reveal whether the email exists
    const message = err instanceof Error && err.message ? err.message : 'Invalid credentials'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
