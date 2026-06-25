import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateActivationCode } from '@/lib/activationCodes'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || (user as { collection?: string }).collection !== 'admin-users') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const {
    quantity,
    productId,
    productVariantId,
    versionFrom,
    versionTo,
    maxInstallations,
    expiresAt,
    sellerId,
    assignSellerAsLifetime,
    codePrefix,
    info,
  } = body as Record<string, unknown>

  const count = typeof quantity === 'number' ? quantity : Number(quantity)
  const parsedProductId = typeof productId === 'number' ? productId : Number(productId)
  const parsedVariantId =
    typeof productVariantId === 'number' ? productVariantId : Number(productVariantId)
  const parsedVersionFrom = typeof versionFrom === 'number' ? versionFrom : Number(versionFrom)
  const parsedVersionTo = typeof versionTo === 'number' ? versionTo : Number(versionTo)
  const parsedMaxInstallations =
    typeof maxInstallations === 'number' ? maxInstallations : Number(maxInstallations ?? 2)

  if (!Number.isFinite(count) || count < 1 || count > 500) {
    return NextResponse.json({ error: 'Quantity must be between 1 and 500' }, { status: 400 })
  }

  if (
    !Number.isFinite(parsedProductId) ||
    !Number.isFinite(parsedVariantId) ||
    !Number.isFinite(parsedVersionFrom) ||
    !Number.isFinite(parsedVersionTo)
  ) {
    return NextResponse.json(
      { error: 'Invalid product/variant/version configuration' },
      { status: 400 },
    )
  }

  const parsedSellerId =
    typeof sellerId === 'number'
      ? sellerId
      : typeof sellerId === 'string' && sellerId.trim()
        ? Number(sellerId)
        : null

  const batchId = `AC-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '')}`
  const prefix = typeof codePrefix === 'string' && codePrefix.trim() ? codePrefix.trim() : 'MX'

  const createdCodes: string[] = []

  for (let i = 0; i < count; i++) {
    let generated = generateActivationCode(prefix)
    let attempts = 0

    while (attempts < 5) {
      const exists = await payload.find({
        collection: 'activation-codes',
        where: { code: { equals: generated } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      if (exists.totalDocs === 0) break
      generated = generateActivationCode(prefix)
      attempts += 1
    }

    await payload.create({
      collection: 'activation-codes',
      data: {
        code: generated,
        batchId,
        generatedBy: user.id,
        product: parsedProductId,
        productVariant: parsedVariantId,
        versionFrom: parsedVersionFrom,
        versionTo: parsedVersionTo,
        maxInstallations: Number.isFinite(parsedMaxInstallations) ? parsedMaxInstallations : 2,
        expiresAt: typeof expiresAt === 'string' && expiresAt.trim() ? expiresAt : undefined,
        seller: parsedSellerId && Number.isFinite(parsedSellerId) ? parsedSellerId : undefined,
        assignSellerAsLifetime: Boolean(assignSellerAsLifetime),
        info: typeof info === 'string' && info.trim() ? info.trim() : undefined,
      },
      overrideAccess: true,
    })

    createdCodes.push(generated)
  }

  return NextResponse.json({
    success: true,
    batchId,
    created: createdCodes.length,
    codes: createdCodes,
  })
}
