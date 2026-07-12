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
import { checkoutPurchaseLimiter, getClientIp } from '@/lib/rateLimiter'

function getAppBaseUrl(req: NextRequest) {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  if (!checkoutPurchaseLimiter.check(clientIp)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
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

  const { variantId, affiliateCode, discountCode, discount_code, email } = body as Record<
    string,
    unknown
  >
  let checkoutEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const targetVariantKey =
    typeof variantId === 'string' || typeof variantId === 'number' ? String(variantId).trim() : ''
  const requestedDiscountCode =
    typeof discountCode === 'string'
      ? discountCode
      : typeof discount_code === 'string'
        ? discount_code
        : ''

  if (!targetVariantKey) {
    return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
  }

  // If no email provided in body, fall back to session user
  if (!checkoutEmail) {
    const sessionUser = await getSessionUser().catch(() => null)
    checkoutEmail = sessionUser?.email ?? ''
  }

  const payload = await getPayload({ config })

  const targetVariantResult = await payload.find({
    collection: 'product-variants',
    where: {
      lemonSqueezyVariantId: {
        equals: targetVariantKey,
      },
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const targetVariant = targetVariantResult.docs[0]

  if (!targetVariant) {
    return NextResponse.json({ error: 'Target variant not found' }, { status: 404 })
  }

  const targetLemonVariantId = Number(targetVariant.lemonSqueezyVariantId)
  if (!Number.isFinite(targetLemonVariantId)) {
    return NextResponse.json(
      { error: 'Target variant is missing Lemon variant mapping' },
      { status: 400 },
    )
  }

  const lemonApiKey = process.env.LEMON_SQUEEZY_API_KEY
  const lemonStoreId = Number(process.env.LEMON_SQUEEZY_STORE_ID)

  if (!lemonApiKey || !Number.isFinite(lemonStoreId)) {
    return NextResponse.json({ error: 'Lemon Squeezy checkout is not configured' }, { status: 500 })
  }

  if (!checkoutEmail) {
    return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
  }

  const isEmailBanned = await isBannedEmailAddress(payload, checkoutEmail)
  if (isEmailBanned) {
    return NextResponse.json({ error: TEMP_EMAIL_REJECT_MESSAGE }, { status: 400 })
  }

  const domain = getEmailDomain(checkoutEmail)
  if (domain) {
    const isDomainBanned =
      (await isBannedDomain(payload, domain)) || (await isBannedEmailDomain(payload, checkoutEmail))
    if (isDomainBanned) {
      return NextResponse.json({ error: TEMP_EMAIL_REJECT_MESSAGE }, { status: 400 })
    }
  }

  const appBaseUrl = getAppBaseUrl(req)
  const basePriceCents = typeof targetVariant.priceCents === 'number' ? targetVariant.priceCents : 0
  const discountResolution = requestedDiscountCode.trim()
    ? await resolveDiscountCodeForAmount(payload, requestedDiscountCode, basePriceCents)
    : { resolution: null, error: null }

  if (discountResolution.error) {
    return NextResponse.json({ error: discountResolution.error }, { status: 400 })
  }

  const discount = discountResolution.resolution

  const checkoutBody = {
    data: {
      type: 'checkouts',
      attributes: {
        ...(discount ? { custom_price: discount.finalAmountCents } : {}),
        checkout_data: {
          email: checkoutEmail,
          custom: {
            flow: 'new_purchase',
            target_variant_id: targetVariantKey,
            intended_email: checkoutEmail,
            ...(typeof affiliateCode === 'string' && affiliateCode.trim()
              ? { affiliate_code: affiliateCode.trim() }
              : {}),
            ...(discount
              ? {
                  discount_code_id: String(discount.discountCode.id),
                  discount_code_value: discount.normalizedCode,
                  discount_type: discount.discountCode.discountType ?? 'percentage',
                  discount_amount_cents: String(discount.discountAmountCents),
                  discount_base_amount_cents: String(basePriceCents),
                  discount_final_amount_cents: String(discount.finalAmountCents),
                }
              : {}),
          },
        },
        product_options: {
          enabled_variants: [targetLemonVariantId],
          redirect_url: `${appBaseUrl}/checkout-success?source=lemon&flow=purchase`,
          receipt_button_text: 'Go to MX GRID',
          receipt_link_url: `${appBaseUrl}/sign-in`,
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

  if (!checkoutResponse.ok) {
    const lemonError =
      checkoutResult?.errors?.[0]?.detail ||
      checkoutResult?.errors?.[0]?.title ||
      checkoutResult?.error ||
      'Failed to create Lemon checkout'

    console.error('[checkout/purchase] Lemon checkout API error', {
      status: checkoutResponse.status,
      statusText: checkoutResponse.statusText,
      response: checkoutResult,
    })

    return NextResponse.json({ error: lemonError }, { status: 502 })
  }

  const checkoutUrl = checkoutResult?.data?.attributes?.url
  if (!checkoutUrl) {
    return NextResponse.json({ error: 'Failed to create Lemon checkout' }, { status: 502 })
  }

  return NextResponse.json({
    checkoutUrl,
    targetVariantId: targetVariantKey,
    discountCode: discount?.normalizedCode ?? null,
    discountAmountCents: discount?.discountAmountCents ?? 0,
  })
}
