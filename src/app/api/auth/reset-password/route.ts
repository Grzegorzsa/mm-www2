import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { h } from '@/lib/h'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { token, password, scs } = body as Record<string, unknown>

  if (typeof token !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Parity check based on the reset token
  if (typeof scs !== 'string' || scs !== h(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    await payload.resetPassword({ collection: 'users', data: { token, password }, overrideAccess: true })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
