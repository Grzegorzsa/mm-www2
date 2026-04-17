import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { h } from '@/lib/h'
import { registerLimiter, getClientIp } from '@/lib/rateLimiter'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!registerLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
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

  // Parity check
  if (typeof scs !== 'string' || scs !== h(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const user = await payload.create({ collection: 'users', data: { email, password } })
    return NextResponse.json({ user }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
