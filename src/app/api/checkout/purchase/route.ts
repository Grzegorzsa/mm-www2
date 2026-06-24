import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getEmailDomain, isBannedDomain, TEMP_EMAIL_REJECT_MESSAGE } from '@/lib/bannedDomains'

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

  const { variantId, affiliateCode } = body as Record<string, unknown>
  const targetVariantId = typeof variantId === 'number' ? variantId : Number(variantId)

  if (!Number.isFinite(targetVariantId)) {
    return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
  }

  const payload = await getPayload({ config })
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

  const lemonApiKey = process.env.LEMON_SQUEEZY_API_KEY
  const lemonStoreId = Number(process.env.LEMON_SQUEEZY_STORE_ID)

  if (!lemonApiKey || !Number.isFinite(lemonStoreId)) {
    return NextResponse.json({ error: 'Lemon Squeezy checkout is not configured' }, { status: 500 })
  }

  const sessionUser = await getSessionUser().catch(() => null)
  const email = sessionUser?.email

  if (email) {
    const domain = getEmailDomain(email)
    if (domain && (await isBannedDomain(payload, domain))) {
      return NextResponse.json({ error: TEMP_EMAIL_REJECT_MESSAGE }, { status: 400 })
    }
  }

  const checkoutBody = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          ...(email ? { email } : {}),
          custom: {
            flow: 'new_purchase',
            target_variant_id: String(targetVariantId),
            ...(typeof affiliateCode === 'string' && affiliateCode.trim()
              ? { affiliate_code: affiliateCode.trim() }
              : {}),
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
    return NextResponse.json({ error: 'Failed to create Lemon checkout' }, { status: 502 })
  }

  const checkoutUrl = checkoutResult?.data?.attributes?.url
  if (!checkoutUrl) {
    return NextResponse.json({ error: 'Failed to create Lemon checkout' }, { status: 502 })
  }

  return NextResponse.json({ checkoutUrl, targetVariantId })
}
