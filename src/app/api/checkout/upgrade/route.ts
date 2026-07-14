import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import {
  getEmailDomain,
  isBannedEmailAddress,
  isBannedEmailDomain,
  isBannedDomain,
  TEMP_EMAIL_REJECT_MESSAGE,
} from '@/lib/bannedDomains'
import { resolveDiscountCodeForAmount } from '@/lib/discountCodes'
import type { CommerceOffer, ProductVariant } from '@/payload-types'
import { checkoutUpgradeLimiter, getClientIp } from '@/lib/rateLimiter'

type RelationValue = string | number | { id?: string | number } | null | undefined

type ResolvedUpgrade = {
  offer: CommerceOffer
  actionType: 'upgrade_replace' | 'crossgrade' | 'trial'
  sourceLicenseId: number
  sourceVariantId: number
}

function getAppBaseUrl(req: NextRequest) {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.NODE_ENV === 'production' ? '' : req.nextUrl.origin)
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
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

function getLicenseProductId(license: { product?: unknown }): number | undefined {
  return asNumberId(getRelationId(license.product as RelationValue))
}

function asProductVariant(value: unknown): ProductVariant | null {
  if (typeof value !== 'object' || value === null) return null
  if (!('id' in value)) return null
  return value as ProductVariant
}

function isCommercialVariant(variant: ProductVariant): boolean {
  if (typeof variant.isCommercial === 'boolean') return variant.isCommercial
  return Boolean(variant.lemonSqueezyVariantId)
}

function isCommercialLicense(license: { productVariants?: unknown }): boolean {
  if (!Array.isArray(license.productVariants)) return false

  return license.productVariants.some((variant) => {
    const populatedVariant = asProductVariant(variant)
    if (!populatedVariant) return false
    return isCommercialVariant(populatedVariant)
  })
}

async function getVariantPriceCents(
  payload: Awaited<ReturnType<typeof getPayload>>,
  variantId: number,
) {
  const variant = await payload.findByID({
    collection: 'product-variants',
    id: variantId,
    depth: 0,
    overrideAccess: true,
  })

  return typeof variant.priceCents === 'number' && variant.priceCents >= 0 ? variant.priceCents : 0
}

function resolveUpgradeForUser(
  offers: CommerceOffer[],
  licenses: Array<{ id: number; product?: unknown; productVariants?: unknown }>,
): ResolvedUpgrade | null {
  for (const offer of offers) {
    const actionType = offer.actionType

    if (actionType === 'crossgrade') {
      const allowedFromProductIds = new Set(getNumberRelationIds(offer.allowedFromProducts))
      if (allowedFromProductIds.size === 0) continue
      const allowedFromVariantIds = new Set(getNumberRelationIds(offer.allowedFromVariants))
      const denyFromVariantIds = new Set(getNumberRelationIds(offer.denyFromVariants))
      const offerIsCommercial = offer.isCommercial ?? true

      for (const license of licenses) {
        const licenseProductId = getLicenseProductId(license)
        if (!licenseProductId || !allowedFromProductIds.has(licenseProductId)) continue
        if (isCommercialLicense(license) !== offerIsCommercial) continue

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
          actionType,
          sourceLicenseId: license.id,
          sourceVariantId: allowedAfterDeny[0],
        }
      }

      continue
    }

    if (actionType !== 'upgrade_replace' && actionType !== 'trial') continue

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
        actionType,
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

  const { variantId, discountCode, discount_code, actionType } = body as Record<string, unknown>
  const targetVariantId = typeof variantId === 'number' ? variantId : Number(variantId)
  const requestedDiscountCode =
    typeof discountCode === 'string'
      ? discountCode
      : typeof discount_code === 'string'
        ? discount_code
        : ''
  const requestedActionType =
    actionType === 'upgrade_replace' || actionType === 'crossgrade' || actionType === 'trial'
      ? actionType
      : null

  if (!Number.isFinite(targetVariantId)) {
    return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientIp = getClientIp(req)
  const rateLimitKey = `${user.id}:${clientIp}`
  if (!checkoutUpgradeLimiter.check(rateLimitKey)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  if (user.blocked) {
    return NextResponse.json(
      { error: 'Your account has been blocked. Please contact support.' },
      { status: 403 },
    )
  }

  const payload = await getPayload({ config })
  const domain = getEmailDomain(user.email)
  const blocked =
    (await isBannedEmailAddress(payload, user.email)) ||
    (domain ? await isBannedDomain(payload, domain) : false) ||
    (await isBannedEmailDomain(payload, user.email))

  if (blocked) {
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
    depth: 2,
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
    // Ignore trial licenses — they are checked separately below
    const isTrial = Boolean((license as { trial?: boolean | null }).trial)
    return !isTrial && variantIds.includes(targetVariantId)
  })

  if (alreadyHasTarget) {
    return NextResponse.json({ error: 'You already own this variant' }, { status: 409 })
  }

  const offersResult = await payload.find({
    collection: 'commerce-offers',
    where: {
      and: [
        { active: { equals: true } },
        { targetVariant: { equals: targetVariantId } },
        ...(requestedActionType
          ? [{ actionType: { equals: requestedActionType } }]
          : [
              {
                or: [
                  { actionType: { equals: 'upgrade_replace' } },
                  { actionType: { equals: 'crossgrade' } },
                  { actionType: { equals: 'trial' } },
                ],
              },
            ]),
      ],
    },
    sort: '-createdAt',
    limit: 50,
    depth: 2,
    overrideAccess: true,
  })

  if (offersResult.totalDocs === 0) {
    return NextResponse.json(
      { error: 'No active upgrade/crossgrade offer configured for this variant' },
      { status: 400 },
    )
  }

  const resolvedUpgrade = resolveUpgradeForUser(offersResult.docs, activeLicensesResult.docs)
  if (!resolvedUpgrade) {
    return NextResponse.json(
      { error: 'No eligible source license for this offer' },
      { status: 400 },
    )
  }

  // --- Trial offer: skip Lemon Squeezy, create license directly ---
  if (resolvedUpgrade.actionType === 'trial') {
    const validDays =
      typeof resolvedUpgrade.offer.validDays === 'number' && resolvedUpgrade.offer.validDays > 0
        ? resolvedUpgrade.offer.validDays
        : null

    if (!validDays) {
      return NextResponse.json(
        { error: 'Trial offer is misconfigured: validDays is required' },
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

    // Check for existing trial on this product + variant for this user
    const existingTrialResult = await payload.find({
      collection: 'licenses',
      where: {
        and: [
          { user: { equals: user.id } },
          { product: { equals: productId } },
          { trial: { equals: true } },
          { productVariants: { equals: targetVariantId } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existingTrialResult.totalDocs > 0) {
      return NextResponse.json(
        { error: 'Trial for this product variant has already been activated on your account' },
        { status: 409 },
      )
    }

    const versionFrom = resolvedUpgrade.offer.versionFrom ?? 1
    const versionTo = resolvedUpgrade.offer.versionTo ?? 1

    const validTill = new Date()
    validTill.setDate(validTill.getDate() + validDays)

    await payload.create({
      collection: 'licenses',
      data: {
        user: user.id,
        product: productId,
        productVariants: [targetVariantId],
        versionFrom,
        versionTo,
        maxInstallations: 2,
        validTill: validTill.toISOString(),
        trial: true,
        active: true,
        info: `Trial activated from commerce offer #${resolvedUpgrade.offer.id}`,
      },
      overrideAccess: true,
    })

    console.info('[checkout/upgrade] Trial license created', {
      userId: user.id,
      targetVariantId,
      commerceOfferId: resolvedUpgrade.offer.id,
      validDays,
      validTill: validTill.toISOString(),
    })

    return NextResponse.json({
      trial: true,
      targetVariantId,
    })
  }
  // --- End trial offer handling ---

  let customPriceCents = 0

  if (
    (resolvedUpgrade.actionType === 'crossgrade' ||
      resolvedUpgrade.actionType === 'upgrade_replace') &&
    typeof resolvedUpgrade.offer.referencePriceCents === 'number' &&
    resolvedUpgrade.offer.referencePriceCents >= 0
  ) {
    customPriceCents = resolvedUpgrade.offer.referencePriceCents
  } else {
    const targetPriceCents = await getVariantPriceCents(payload, targetVariantId)
    const sourcePriceCents = await getVariantPriceCents(payload, resolvedUpgrade.sourceVariantId)

    if (typeof targetPriceCents !== 'number' || typeof sourcePriceCents !== 'number') {
      return NextResponse.json(
        {
          error: 'Could not determine variant prices for this offer',
        },
        { status: 400 },
      )
    }

    customPriceCents = Math.max(targetPriceCents - sourcePriceCents, 0)
  }

  const discountResolution = requestedDiscountCode.trim()
    ? await resolveDiscountCodeForAmount(payload, requestedDiscountCode, customPriceCents)
    : { resolution: null, error: null }

  if (discountResolution.error) {
    return NextResponse.json({ error: discountResolution.error }, { status: 400 })
  }

  const discount = discountResolution.resolution
  const finalPriceCents = discount ? discount.finalAmountCents : customPriceCents

  try {
    const appBaseUrl = getAppBaseUrl(req)
    if (!appBaseUrl) {
      return NextResponse.json({ error: 'Canonical app URL is not configured' }, { status: 500 })
    }

    const checkoutBody = {
      data: {
        type: 'checkouts',
        attributes: {
          ...(finalPriceCents > 0 ? { custom_price: finalPriceCents } : {}),
          checkout_data: {
            email: user.email,
            custom: {
              flow: resolvedUpgrade.actionType,
              user_id: String(user.id),
              user_email: user.email,
              current_license_id: String(resolvedUpgrade.sourceLicenseId),
              source_variant_id: String(resolvedUpgrade.sourceVariantId),
              target_variant_id: String(targetVariantId),
              commerce_offer_id: String(resolvedUpgrade.offer.id),
              ...(discount
                ? {
                    discount_code_id: String(discount.discountCode.id),
                    discount_code_value: discount.normalizedCode,
                    discount_type: discount.discountCode.discountType ?? 'percentage',
                    discount_amount_cents: String(discount.discountAmountCents),
                    discount_base_amount_cents: String(customPriceCents),
                    discount_final_amount_cents: String(finalPriceCents),
                  }
                : {}),
            },
          },
          product_options: {
            enabled_variants: [targetLemonVariantId],
            redirect_url: `${appBaseUrl}/checkout-success?source=lemon&flow=upgrade`,
            receipt_button_text: 'Go to MX GRID',
            receipt_link_url: `${appBaseUrl}/user-panel/purchases`,
          },
          checkout_options: {
            embed: false,
            discount: false,
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

    // console.info('[checkout/upgrade] Creating Lemon checkout', {
    //   userId: user.id,
    //   userEmail: user.email,
    //   targetVariantId,
    //   targetLemonVariantId,
    //   sourceVariantId: resolvedUpgrade.sourceVariantId,
    //   sourceLicenseId: resolvedUpgrade.sourceLicenseId,
    //   actionType: resolvedUpgrade.actionType,
    //   commerceOfferId: resolvedUpgrade.offer.id,
    //   customPriceCents: finalPriceCents,
    //   discountCode: discount?.normalizedCode ?? null,
    //   discountAmountCents: discount?.discountAmountCents ?? 0,
    //   enabledVariants: [targetLemonVariantId],
    // })

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

    // console.info('[checkout/upgrade] Lemon checkout response', {
    //   status: checkoutResponse.status,
    //   statusText: checkoutResponse.statusText,
    //   responseData: JSON.stringify(checkoutResult, null, 2),
    // })

    if (!checkoutResponse.ok) {
      const lemonError =
        checkoutResult?.errors?.[0]?.detail ||
        checkoutResult?.errors?.[0]?.title ||
        checkoutResult?.error ||
        'Failed to create Lemon checkout'

      console.error('Lemon checkout API error:', {
        status: checkoutResponse.status,
        statusText: checkoutResponse.statusText,
        body: JSON.stringify(checkoutResult, null, 2),
      })
      return NextResponse.json({ error: lemonError }, { status: 502 })
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
      customPriceCents: finalPriceCents,
      discountCode: discount?.normalizedCode ?? null,
      discountAmountCents: discount?.discountAmountCents ?? 0,
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
