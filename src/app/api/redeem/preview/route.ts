import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getValidActivationCode } from '@/lib/activationCodes'
import { activationPreviewLimiter, getClientIp } from '@/lib/rateLimiter'

type RelationValue = number | string | { id?: number | string; name?: string } | null | undefined

function relationToNumber(value: RelationValue): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (typeof value === 'object' && value && 'id' in value) return relationToNumber(value.id)
  return null
}

function relationName(value: RelationValue): string | null {
  if (typeof value === 'object' && value && 'name' in value && typeof value.name === 'string') {
    return value.name
  }
  return null
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!activationPreviewLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many preview attempts. Please try again later.' },
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

  const { code } = body as Record<string, unknown>
  if (typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: 'Activation code is required' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const validated = await getValidActivationCode(payload, code)

  if (validated.error || !validated.code) {
    return NextResponse.json(
      { error: validated.error ?? 'Activation code is invalid' },
      { status: 400 },
    )
  }

  const productId = relationToNumber(validated.code.product)
  const productVariantId = relationToNumber(validated.code.productVariant)

  return NextResponse.json({
    valid: true,
    activationCode: {
      id: validated.code.id,
      productId,
      productVariantId,
      productName: relationName(validated.code.product),
      productVariantName: relationName(validated.code.productVariant),
      expiresAt: validated.code.expiresAt ?? null,
    },
  })
}
