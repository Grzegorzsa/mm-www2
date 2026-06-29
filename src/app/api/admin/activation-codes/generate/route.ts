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
    definitionId,
    productId,
    productVariantId,
    versionFrom,
    versionTo,
    trial,
    maxInstallations,
    validDays,
    expiresAt,
    sellerId,
    assignSellerAsLifetime,
    info,
  } = body as Record<string, unknown>

  const count = typeof quantity === 'number' ? quantity : Number(quantity)
  const parsedDefinitionId = typeof definitionId === 'number' ? definitionId : Number(definitionId)
  const parsedProductId = typeof productId === 'number' ? productId : Number(productId)
  const parsedVariantId =
    typeof productVariantId === 'number' ? productVariantId : Number(productVariantId)
  const parsedVersionFrom = typeof versionFrom === 'number' ? versionFrom : Number(versionFrom)
  const parsedVersionTo = typeof versionTo === 'number' ? versionTo : Number(versionTo)
  const parsedMaxInstallations =
    typeof maxInstallations === 'number' ? maxInstallations : Number(maxInstallations ?? 2)
  const parsedValidDays =
    typeof validDays === 'number'
      ? validDays
      : typeof validDays === 'string' && validDays.trim()
        ? Number(validDays)
        : null

  if (!Number.isFinite(count) || !Number.isInteger(count) || count < 1 || count > 1000) {
    return NextResponse.json(
      { error: 'Quantity must be an integer between 1 and 1000' },
      { status: 400 },
    )
  }

  if (
    parsedValidDays !== null &&
    (!Number.isFinite(parsedValidDays) || !Number.isInteger(parsedValidDays) || parsedValidDays < 1)
  ) {
    return NextResponse.json({ error: 'Valid Days must be a positive integer' }, { status: 400 })
  }

  const parsedSellerId =
    typeof sellerId === 'number'
      ? sellerId
      : typeof sellerId === 'string' && sellerId.trim()
        ? Number(sellerId)
        : null

  const batchId = `AC-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '')}`

  let definition:
    | {
        id: number
      }
    | undefined

  if (Number.isFinite(parsedDefinitionId)) {
    const foundDefinition = await payload.findByID({
      collection: 'activation-code-definitions',
      id: parsedDefinitionId,
      depth: 0,
      overrideAccess: true,
    })

    if (!foundDefinition || !Number.isFinite(foundDefinition.id)) {
      return NextResponse.json({ error: 'Activation code definition not found' }, { status: 404 })
    }

    definition = { id: foundDefinition.id }
  }

  if (!definition) {
    if (
      !Number.isFinite(parsedProductId) ||
      !Number.isFinite(parsedVariantId) ||
      !Number.isFinite(parsedVersionFrom) ||
      !Number.isFinite(parsedVersionTo)
    ) {
      return NextResponse.json(
        { error: 'Invalid definitionId or product/variant/version configuration' },
        { status: 400 },
      )
    }

    const definitionWhere = {
      and: [
        { product: { equals: parsedProductId } },
        { productVariant: { equals: parsedVariantId } },
        { versionFrom: { equals: parsedVersionFrom } },
        { versionTo: { equals: parsedVersionTo } },
        { trial: { equals: Boolean(trial) } },
        {
          maxInstallations: {
            equals: Number.isFinite(parsedMaxInstallations) ? parsedMaxInstallations : 2,
          },
        },
        ...(parsedValidDays !== null
          ? [{ validDays: { equals: parsedValidDays } }]
          : [{ validDays: { exists: false } }]),
        ...(parsedSellerId && Number.isFinite(parsedSellerId)
          ? [{ seller: { equals: parsedSellerId } }]
          : [{ seller: { exists: false } }]),
        { assignSellerAsLifetime: { equals: Boolean(assignSellerAsLifetime) } },
      ],
    }

    const existingDefinitionResult = await payload.find({
      collection: 'activation-code-definitions',
      where: definitionWhere as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const createdOrExistingDefinition =
      existingDefinitionResult.docs[0] ??
      (await payload.create({
        collection: 'activation-code-definitions',
        data: {
          name: `Definition ${parsedProductId}-${parsedVariantId} v${parsedVersionFrom}-${parsedVersionTo}${Boolean(trial) ? ' TRIAL' : ''}`,
          product: parsedProductId,
          productVariant: parsedVariantId,
          versionFrom: parsedVersionFrom,
          versionTo: parsedVersionTo,
          trial: Boolean(trial),
          maxInstallations: Number.isFinite(parsedMaxInstallations) ? parsedMaxInstallations : 2,
          validDays: parsedValidDays,
          seller: parsedSellerId && Number.isFinite(parsedSellerId) ? parsedSellerId : undefined,
          assignSellerAsLifetime: Boolean(assignSellerAsLifetime),
          info: typeof info === 'string' && info.trim() ? info.trim() : undefined,
        },
        overrideAccess: true,
      }))

    definition = { id: createdOrExistingDefinition.id }
  }

  const createdCodes: string[] = []

  for (let i = 0; i < count; i++) {
    let attempts = 0
    let created = false

    while (attempts < 20 && !created) {
      const generated = generateActivationCode()

      const exists = await payload.find({
        collection: 'activation-codes',
        where: { code: { equals: generated } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      if (exists.totalDocs > 0) {
        attempts += 1
        continue
      }

      try {
        await payload.create({
          collection: 'activation-codes',
          data: {
            definition: definition.id,
            code: generated,
            batchId,
            generatedBy: user.id,
            expiresAt: typeof expiresAt === 'string' && expiresAt.trim() ? expiresAt : undefined,
            info: typeof info === 'string' && info.trim() ? info.trim() : undefined,
          },
          overrideAccess: true,
        })

        createdCodes.push(generated)
        created = true
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message.toLowerCase() : ''
        const isDuplicate =
          message.includes('duplicate') ||
          message.includes('unique') ||
          message.includes('already exists')

        if (!isDuplicate) {
          throw error
        }

        attempts += 1
      }
    }

    if (!created) {
      return NextResponse.json(
        { error: 'Could not generate a unique activation code. Please try again.' },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({
    success: true,
    batchId,
    created: createdCodes.length,
    codes: createdCodes,
  })
}
