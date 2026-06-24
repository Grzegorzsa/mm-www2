import { NextRequest, NextResponse } from 'next/server'
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
  const checkoutRequestId =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `checkout-${Date.now()}`

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
      and: [{ user: { equals: user.id } }, { active: { equals: true } }],
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
    const checkoutBody = {
      data: {
        type: 'checkouts',
        attributes: {
          ...(customPriceCents > 0 ? { custom_price: customPriceCents } : {}),
          checkout_data: {
            email: user.email,
            custom: {
              flow: 'upgrade_replace',
              checkout_request_id: checkoutRequestId,
              user_id: String(user.id),
              user_email: user.email,
              current_license_id: String(resolvedUpgrade.sourceLicenseId),
              source_variant_id: String(resolvedUpgrade.sourceVariantId),
              target_variant_id: String(targetVariantId),
              commerce_offer_id: String(resolvedUpgrade.offer.id),
            },
          },
          product_options: {
            enabled_variants: [targetLemonVariantId],
          },
          checkout_options: {
            embed: false,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: String(lemonStoreId),
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: String(targetLemonVariantId),
            },
          },
        },
      },
    }

    console.info('[checkout/upgrade] Creating Lemon checkout', {
      checkoutRequestId,
      userId: user.id,
      userEmail: user.email,
      targetVariantId,
      targetLemonVariantId,
      sourceVariantId: resolvedUpgrade.sourceVariantId,
      sourceLicenseId: resolvedUpgrade.sourceLicenseId,
      commerceOfferId: resolvedUpgrade.offer.id,
      customPriceCents,
      enabledVariants: [targetLemonVariantId],
    })

    const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${lemonApiKey}`,
      },
      body: JSON.stringify(checkoutBody),
    })

    const checkoutResult = await checkoutResponse.json().catch(() => null)

    console.info('[checkout/upgrade] Lemon checkout response', {
      checkoutRequestId,
      status: checkoutResponse.status,
      statusText: checkoutResponse.statusText,
      responseData: JSON.stringify(checkoutResult, null, 2),
    })

    if (!checkoutResponse.ok) {
      console.error('Lemon checkout API error:', {
        checkoutRequestId,
        status: checkoutResponse.status,
        statusText: checkoutResponse.statusText,
        body: JSON.stringify(checkoutResult, null, 2),
      })
      return NextResponse.json({ error: 'Failed to create Lemon checkout' }, { status: 502 })
    }

    const checkoutUrl = checkoutResult?.data?.attributes?.url
    if (!checkoutUrl) {
      console.error('Lemon checkout response missing url:', {
        status: checkoutResponse.status,
        body: JSON.stringify(checkoutResult, null, 2),
      })
      return NextResponse.json({ error: 'Failed to create Lemon checkout' }, { status: 502 })
    }

    return NextResponse.json({
      checkoutUrl,
      checkoutRequestId,
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
