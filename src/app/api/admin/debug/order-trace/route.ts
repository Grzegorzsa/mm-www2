import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

type RelationValue = string | number | { id?: string | number } | null | undefined

function relationId(value: RelationValue): string | number | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'object' && value.id) return value.id
  return null
}

export async function GET(req: NextRequest) {
  const externalOrderId = req.nextUrl.searchParams.get('externalOrderId')?.trim()

  if (!externalOrderId) {
    return NextResponse.json({ error: 'Missing externalOrderId query param' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || (user as { collection?: string }).collection !== 'admin-users') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ordersResult = await payload.find({
    collection: 'orders',
    where: {
      or: [
        { externalOrderId: { equals: externalOrderId } },
        { lemonOrderId: { equals: externalOrderId } },
      ],
    },
    sort: '-createdAt',
    limit: 5,
    depth: 2,
    user,
    overrideAccess: false,
  })

  if (!ordersResult.totalDocs) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = ordersResult.docs[0]

  const txFromOrderId = relationId(order.licenseTransaction as RelationValue)
  let transaction: unknown = null

  if (txFromOrderId) {
    try {
      transaction = await payload.findByID({
        collection: 'license-transactions',
        id: txFromOrderId,
        depth: 2,
        user,
        overrideAccess: false,
      })
    } catch {
      transaction = null
    }
  }

  if (!transaction) {
    const fallbackTransactions = await payload.find({
      collection: 'license-transactions',
      where: {
        order: { equals: order.id },
      },
      sort: '-createdAt',
      limit: 5,
      depth: 2,
      user,
      overrideAccess: false,
    })

    transaction = fallbackTransactions.docs[0] ?? null
  }

  const licensesByOrder = await payload.find({
    collection: 'licenses',
    where: { order: { equals: order.id } },
    sort: '-createdAt',
    limit: 10,
    depth: 2,
    user,
    overrideAccess: false,
  })

  return NextResponse.json({
    query: { externalOrderId },
    summary: {
      matchedOrders: ordersResult.totalDocs,
      usedOrderId: order.id,
      hasLinkedTransaction: Boolean(txFromOrderId),
      linkedLicensesCount: licensesByOrder.totalDocs,
    },
    order,
    transaction,
    licensesByOrder: licensesByOrder.docs,
    note:
      ordersResult.totalDocs > 1
        ? 'Multiple orders matched this externalOrderId. Returned the newest one in "order".'
        : null,
  })
}
