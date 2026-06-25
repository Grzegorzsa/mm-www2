import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

type ActivationCodeReportDoc = {
  id: number
  code: string
  redeemedAt?: string | null
  product?: { id?: number; name?: string } | number | null
  productVariant?: { id?: number; name?: string } | number | null
}

function relationKey(value: { id?: number; name?: string } | number | null | undefined) {
  if (typeof value === 'number') return { id: value, name: String(value) }
  if (typeof value === 'object' && value && typeof value.id === 'number') {
    return { id: value.id, name: value.name ?? String(value.id) }
  }
  return null
}

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || (user as { collection?: string }).collection !== 'admin-users') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sellerIdRaw = req.nextUrl.searchParams.get('sellerId')
  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')

  const filters: Array<Record<string, unknown>> = [{ redeemedAt: { exists: true } }]

  if (sellerIdRaw && sellerIdRaw.trim()) {
    const sellerId = Number(sellerIdRaw)
    if (!Number.isFinite(sellerId)) {
      return NextResponse.json({ error: 'Invalid sellerId' }, { status: 400 })
    }
    filters.push({ seller: { equals: sellerId } })
  }

  if (from && from.trim()) {
    filters.push({ redeemedAt: { greater_than_equal: from } })
  }

  if (to && to.trim()) {
    filters.push({ redeemedAt: { less_than_equal: to } })
  }

  const result = await payload.find({
    collection: 'activation-codes',
    where: { and: filters as any },
    sort: '-redeemedAt',
    limit: 1000,
    depth: 1,
    overrideAccess: true,
  })

  const breakdown = new Map<string, { product: string; variant: string; count: number }>()

  for (const doc of result.docs as ActivationCodeReportDoc[]) {
    const product = relationKey(doc.product ?? null)
    const variant = relationKey(doc.productVariant ?? null)
    const key = `${product?.id ?? 'unknown'}:${variant?.id ?? 'unknown'}`
    const current = breakdown.get(key)

    if (!current) {
      breakdown.set(key, {
        product: product?.name ?? 'Unknown product',
        variant: variant?.name ?? 'Unknown variant',
        count: 1,
      })
    } else {
      current.count += 1
    }
  }

  return NextResponse.json({
    totalRedeemed: result.totalDocs,
    filters: {
      sellerId: sellerIdRaw || null,
      from: from || null,
      to: to || null,
    },
    byProductVariant: Array.from(breakdown.values()).sort((a, b) => b.count - a.count),
  })
}
