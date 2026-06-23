import { NextRequest, NextResponse } from 'next/server'
import { createCheckout, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getEmailDomain, isBannedDomain, TEMP_EMAIL_REJECT_MESSAGE } from '@/lib/bannedDomains'
import type { CommerceOffer } from '@/payload-types'

type RelationValue = string | number | { id?: string | number } | null | undefined

type ResolvedUpgrade = {
  offer: CommerceOffer
  sourceLicenseId: number
  sourceVariantId: number
}

function getRelationId(value: RelationValue): string | number | undefined {
  if (!value) return undefined
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'object' && value.id) return value.id
  return undefined
}

function asNumberId(value: string | number | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function getNumberRelationIds(values: unknown): number[] {
  if (!Array.isArray(values)) return []

  return values
    .map((value) => getRelationId(value as RelationValue))
    .map((value) => asNumberId(value))
    .filter((value): value is number => value !== undefined)
}

function getLicenseVariantIds(license: { productVariants?: unknown }): number[] {
  return getNumberRelationIds(license?.productVariants)
}

async function getVariantReferencePriceCents(
  payload: Awaited<ReturnType<typeof getPayload>>,
  variantId: number,
) {
  const offerResult = await payload.find({
    collection: 'commerce-offers',
    where: {
      and: [{ active: { equals: true } }, { targetVariant: { equals: variantId } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const referencePrice = offerResult.docs[0]?.referencePriceCents
  return typeof referencePrice === 'number' && referencePrice >= 0 ? referencePrice : 0
}

function resolveUpgradeForUser(
  offers: CommerceOffer[],
  licenses: Array<{ id: number; productVariants?: unknown }>,
): ResolvedUpgrade | null {
  for (const offer of offers) {
    const allowedFromVariantIds = new Set(getNumberRelationIds(offer.allowedFromVariants))
    const denyFromVariantIds = new Set(getNumberRelationIds(offer.denyFromVariants))

    for (const license of licenses) {
      const licenseVariantIds = getLicenseVariantIds(license)
      const allowedMatches =
        allowedFromVariantIds.size === 0
          ? licenseVariantIds
          : licenseVariantIds.filter((variantId) => allowedFromVariantIds.has(variantId))

      if (allowedMatches.length === 0) continue

      const allowedAfterDeny = allowedMatches.filter(
        (variantId) => !denyFromVariantIds.has(variantId),
      )
      if (allowedAfterDeny.length === 0) continue

      return {
        offer,
        sourceLicenseId: license.id,
        sourceVariantId: allowedAfterDeny[0],
      }
    }
  }

  return null
}

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

  const { variantId } = body as Record<string, unknown>
  const targetVariantId = typeof variantId === 'number' ? variantId : Number(variantId)

  if (!Number.isFinite(targetVariantId)) {
    return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.blocked) {
    return NextResponse.json(
      { error: 'Your account has been blocked. Please contact support.' },
      { status: 403 },
    )
  }

  const payload = await getPayload({ config })
  const domain = getEmailDomain(user.email)
  if (domain && (await isBannedDomain(payload, domain))) {
    return NextResponse.json({ error: TEMP_EMAIL_REJECT_MESSAGE }, { status: 400 })
  }

  const lemonApiKey = process.env.LEMON_SQUEEZY_API_KEY
  const lemonStoreId = Number(process.env.LEMON_SQUEEZY_STORE_ID)

  if (!lemonApiKey || !Number.isFinite(lemonStoreId)) {
    return NextResponse.json({ error: 'Lemon Squeezy checkout is not configured' }, { status: 500 })
  }

  const targetVariant = await payload.findByID({
    collection: 'product-variants',
    id: targetVariantId,
    depth: 0,
    overrideAccess: true,
  })

  const targetLemonVariantId = Number(targetVariant.lemonSqueezyVariantId)
  if (!Number.isFinite(targetLemonVariantId)) {
    return NextResponse.json(
      { error: 'Target variant is missing Lemon variant mapping' },
      { status: 400 },
    )
  }

  const productId = asNumberId(getRelationId(targetVariant.product as RelationValue))
  if (!productId) {
    return NextResponse.json(
      { error: 'Target variant product mapping is invalid' },
      { status: 400 },
    )
  }

  const activeLicensesResult = await payload.find({
    collection: 'licenses',
    where: {
      and: [
        { user: { equals: user.id } },
        { product: { equals: productId } },
        { active: { equals: true } },
      ],
    },
    limit: 100,
    sort: '-createdAt',
    depth: 0,
    overrideAccess: true,
  })

  if (activeLicensesResult.totalDocs === 0) {
    return NextResponse.json(
      { error: 'No active license found for this upgrade path' },
      { status: 400 },
    )
  }

  const alreadyHasTarget = activeLicensesResult.docs.some((license) => {
    const variantIds = getLicenseVariantIds(license)
    return variantIds.includes(targetVariantId)
  })

  if (alreadyHasTarget) {
    return NextResponse.json({ error: 'You already own this variant' }, { status: 409 })
  }

  const offersResult = await payload.find({
    collection: 'commerce-offers',
    where: {
      and: [
        { active: { equals: true } },
        { actionType: { equals: 'upgrade_replace' } },
        { targetVariant: { equals: targetVariantId } },
      ],
    },
    sort: '-createdAt',
    limit: 50,
    depth: 2,
    overrideAccess: true,
  })

  if (offersResult.totalDocs === 0) {
    return NextResponse.json(
      { error: 'No active upgrade offer configured for this variant' },
      { status: 400 },
    )
  }

  const resolvedUpgrade = resolveUpgradeForUser(offersResult.docs, activeLicensesResult.docs)
  if (!resolvedUpgrade) {
    return NextResponse.json(
      { error: 'No eligible source license for this upgrade' },
      { status: 400 },
    )
  }

  const targetPriceCents = await getVariantReferencePriceCents(payload, targetVariantId)
  const sourcePriceCents = await getVariantReferencePriceCents(
    payload,
    resolvedUpgrade.sourceVariantId,
  )

  if (typeof targetPriceCents !== 'number' || typeof sourcePriceCents !== 'number') {
    return NextResponse.json(
      {
        error: 'Could not determine variant prices for upgrade',
      },
      { status: 400 },
    )
  }

  const customPriceCents = Math.max(targetPriceCents - sourcePriceCents, 0)

  try {
    lemonSqueezySetup({ apiKey: lemonApiKey })

    const checkoutData: {
      email: string
      custom?: Record<string, string>
      customPrice?: number
    } = {
      email: user.email,
      custom: {
        flow: 'upgrade_replace',
        userId: String(user.id),
        userEmail: user.email,
        currentLicenseId: String(resolvedUpgrade.sourceLicenseId),
        sourceVariantId: String(resolvedUpgrade.sourceVariantId),
        targetVariantId: String(targetVariantId),
        commerceOfferId: String(resolvedUpgrade.offer.id),
      },
    }

    // Lemon API expects custom_price to be a positive integer when provided.
    if (customPriceCents > 0) {
      checkoutData.customPrice = customPriceCents
    }

    const checkoutPayload = {
      checkoutData,
    } as any

    const checkoutResponse = await createCheckout(
      lemonStoreId,
      targetLemonVariantId,
      checkoutPayload,
    )

    const checkoutUrl = checkoutResponse.data?.data?.attributes?.url
    if (!checkoutUrl) {
      const responseData = checkoutResponse.data
      console.error('Lemon SDK response missing checkout URL:', {
        statusCode: checkoutResponse.statusCode,
        error: checkoutResponse.error
          ? {
              name: checkoutResponse.error.name,
              message: checkoutResponse.error.message,
              cause: checkoutResponse.error.cause,
            }
          : null,
        errors:
          responseData && typeof responseData === 'object' && 'errors' in responseData
            ? (responseData as { errors?: unknown }).errors
            : null,
        responseData: JSON.stringify(responseData, null, 2),
      })
      return NextResponse.json({ error: 'Failed to create Lemon checkout' }, { status: 502 })
    }

    return NextResponse.json({
      checkoutUrl,
      customPriceCents,
      sourceVariantId: resolvedUpgrade.sourceVariantId,
      targetVariantId,
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error creating Lemon checkout:', {
      message: errorMessage,
      cause: err instanceof Error ? err.cause : null,
      fullError: JSON.stringify(err, null, 2),
    })
    return NextResponse.json(
      { error: 'Failed to initialize checkout. Please try again.' },
      { status: 500 },
    )
  }
}
