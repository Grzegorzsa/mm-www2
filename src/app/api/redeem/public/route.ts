import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isTrustedBrowserOrigin } from '@/lib/browserOrigin'
import { h } from '@/lib/h'
import { registerLimiter, getClientIp } from '@/lib/rateLimiter'
import {
  isBannedEmailAddress,
  isBannedEmailDomain,
  TEMP_EMAIL_REJECT_MESSAGE,
} from '@/lib/bannedDomains'
import { getValidActivationCode, redeemActivationCodeForUser } from '@/lib/activationCodes'

type RelationValue = number | string | { id?: number | string; active?: boolean } | null | undefined

function relationToNumber(value: RelationValue): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (typeof value === 'object' && value && 'id' in value) return relationToNumber(value.id)
  return null
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!registerLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many redeem attempts. Please try again later.' },
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

  if (!isTrustedBrowserOrigin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code, email, password, scs } = body as Record<string, unknown>

  if (typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: 'Activation code is required' }, { status: 400 })
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (typeof scs !== 'string' || scs !== h(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  const blocked =
    (await isBannedEmailAddress(payload, email)) || (await isBannedEmailDomain(payload, email))
  if (blocked) {
    return NextResponse.json({ error: TEMP_EMAIL_REJECT_MESSAGE }, { status: 400 })
  }

  const existingUser = await payload.find({
    collection: 'users',
    where: { email: { equals: email.trim().toLowerCase() } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existingUser.totalDocs > 0) {
    return NextResponse.json(
      {
        error: 'Account already exists. Please sign in and redeem this code from your user panel.',
      },
      { status: 409 },
    )
  }

  const validCode = await getValidActivationCode(payload, code)
  if (validCode.error || !validCode.code) {
    return NextResponse.json(
      { error: validCode.error ?? 'Activation code is invalid' },
      { status: 400 },
    )
  }

  const sellerId = relationToNumber(validCode.code.seller)
  const shouldAssignSeller = Boolean(validCode.code.assignSellerAsLifetime)

  const createdUser = await payload.create({
    collection: 'users',
    data: {
      email: email.trim().toLowerCase(),
      password,
      ...(sellerId && shouldAssignSeller ? { referredBy: sellerId } : {}),
    },
    overrideAccess: true,
    context: {
      preventWelcomeLicenses: true,
    },
  })

  const redeemResult = await redeemActivationCodeForUser(
    payload,
    validCode.code,
    createdUser.id,
    'public_redeem',
  )

  if (!redeemResult.success) {
    return NextResponse.json({ error: redeemResult.error ?? 'Redeem failed' }, { status: 400 })
  }

  return NextResponse.json(
    {
      success: true,
      message:
        'Activation successful. Please verify your email first, then sign in to access your licenses.',
    },
    { status: 201 },
  )
}
