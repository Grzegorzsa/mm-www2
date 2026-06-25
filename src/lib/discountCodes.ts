import type { Payload } from 'payload'

export type DiscountCodeType = 'percentage' | 'fixed_amount'

export type DiscountCodeRecord = {
  id: number
  code?: string | null
  active?: boolean | null
  discountType?: DiscountCodeType | null
  discountValue?: number | null
  minimumSubtotalCents?: number | null
  maxUses?: number | null
  startsAt?: string | null
  endsAt?: string | null
  affiliatePartner?: number | { id?: number | null } | null
  affiliateLifetime?: boolean | null
}

export type DiscountCheckoutResolution = {
  discountCode: DiscountCodeRecord
  normalizedCode: string
  discountAmountCents: number
  finalAmountCents: number
  minimumSubtotalCents: number
}

function normalizeDiscountCode(value: string): string {
  return value.trim().toLowerCase()
}

function getRelationId(value: DiscountCodeRecord['affiliatePartner']): number | null {
  if (!value) return null
  if (typeof value === 'number') return value
  if (typeof value === 'object' && typeof value.id === 'number') return value.id
  return null
}

export function normalizeDiscountCodeInput(value: string): string {
  return normalizeDiscountCode(value)
}

export async function resolveDiscountCodeForAmount(
  payload: Payload,
  rawCode: string,
  baseAmountCents: number,
  now = new Date(),
): Promise<{ resolution: DiscountCheckoutResolution | null; error: string | null }> {
  const normalizedCode = normalizeDiscountCode(rawCode)
  if (!normalizedCode) {
    return { resolution: null, error: null }
  }

  if (!Number.isFinite(baseAmountCents) || baseAmountCents <= 0) {
    return {
      resolution: null,
      error: 'Discount codes require a priced checkout amount',
    }
  }

  const result = await payload.find({
    collection: 'discount-codes',
    where: {
      and: [{ code: { equals: normalizedCode } }, { active: { equals: true } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const discountCode = result.docs[0] as DiscountCodeRecord | undefined
  if (!discountCode) {
    return {
      resolution: null,
      error: 'Invalid or expired discount code',
    }
  }

  const nowTime = now.getTime()
  const startsAtTime = discountCode.startsAt ? new Date(discountCode.startsAt).getTime() : null
  const endsAtTime = discountCode.endsAt ? new Date(discountCode.endsAt).getTime() : null

  if (
    (startsAtTime !== null && Number.isFinite(startsAtTime) && startsAtTime > nowTime) ||
    (endsAtTime !== null && Number.isFinite(endsAtTime) && endsAtTime < nowTime)
  ) {
    return {
      resolution: null,
      error: 'Invalid or expired discount code',
    }
  }

  const maxUses = typeof discountCode.maxUses === 'number' ? discountCode.maxUses : null
  if (maxUses && maxUses > 0) {
    const usageResult = await payload.find({
      collection: 'orders',
      where: { discountCode: { equals: discountCode.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (usageResult.totalDocs >= maxUses) {
      return {
        resolution: null,
        error: 'This discount code has reached its usage limit',
      }
    }
  }

  const discountType = discountCode.discountType ?? 'percentage'
  const discountValue =
    typeof discountCode.discountValue === 'number' ? discountCode.discountValue : 0
  if (discountValue <= 0) {
    return {
      resolution: null,
      error: 'Discount code is misconfigured',
    }
  }

  if (discountType === 'percentage' && discountValue > 100) {
    return {
      resolution: null,
      error: 'Percentage discount code cannot exceed 100%',
    }
  }

  const discountAmountCents =
    discountType === 'fixed_amount'
      ? Math.floor(discountValue)
      : Math.floor((baseAmountCents * discountValue) / 100)

  const minimumSubtotalCents =
    typeof discountCode.minimumSubtotalCents === 'number' && discountCode.minimumSubtotalCents >= 0
      ? discountCode.minimumSubtotalCents
      : 1000

  const finalAmountCents = Math.max(baseAmountCents - discountAmountCents, 0)
  if (finalAmountCents <= 0) {
    return {
      resolution: null,
      error: 'Discount code cannot reduce the checkout to zero',
    }
  }

  if (finalAmountCents < minimumSubtotalCents) {
    return {
      resolution: null,
      error: `Discount code cannot reduce the order below ${minimumSubtotalCents / 100} USD`,
    }
  }

  return {
    resolution: {
      discountCode,
      normalizedCode,
      discountAmountCents,
      finalAmountCents,
      minimumSubtotalCents,
    },
    error: null,
  }
}

export function getDiscountAffiliatePartnerId(discountCode: DiscountCodeRecord): number | null {
  return getRelationId(discountCode.affiliatePartner)
}
