import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getValidActivationCode, redeemActivationCodeForUser } from '@/lib/activationCodes'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const { code } = body as Record<string, unknown>
  if (typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: 'Activation code is required' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const validCode = await getValidActivationCode(payload, code)

  if (validCode.error || !validCode.code) {
    return NextResponse.json(
      { error: validCode.error ?? 'Activation code is invalid' },
      { status: 400 },
    )
  }

  const redeemResult = await redeemActivationCodeForUser(
    payload,
    validCode.code,
    user.id,
    'panel_redeem',
  )
  if (!redeemResult.success) {
    return NextResponse.json({ error: redeemResult.error ?? 'Redeem failed' }, { status: 400 })
  }

  return NextResponse.json({ success: true, message: 'Activation code redeemed successfully.' })
}
