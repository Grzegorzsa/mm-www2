import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

type CsvCodeDoc = {
  code: string
  batchId?: string | null
  definition?: {
    product?: { id?: number; name?: string } | number | null
    productVariant?: { id?: number; name?: string } | number | null
    trial?: boolean | null
    validDays?: number | null
    versionFrom?: number | null
    versionTo?: number | null
    maxInstallations?: number | null
    info?: string | null
  } | null
  product?: { id?: number; name?: string } | number | null
  productVariant?: { id?: number; name?: string } | number | null
  trial?: boolean | null
  validDays?: number | null
  versionFrom?: number | null
  versionTo?: number | null
  maxInstallations?: number | null
  expiresAt?: string | null
  info?: string | null
  createdAt?: string
}

function relationLabel(value: { id?: number; name?: string } | number | null | undefined): string {
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    return value.name ?? (typeof value.id === 'number' ? String(value.id) : '')
  }
  return ''
}

function csvEscape(value: unknown): string {
  const stringValue = typeof value === 'string' ? value : value == null ? '' : String(value)
  const escaped = stringValue.replace(/\"/g, '\"\"')
  return `\"${escaped}\"`
}

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || (user as { collection?: string }).collection !== 'admin-users') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const batchId = req.nextUrl.searchParams.get('batchId')?.trim()
  if (!batchId) {
    return NextResponse.json({ error: 'batchId is required' }, { status: 400 })
  }

  const result = await payload.find({
    collection: 'activation-codes',
    where: { batchId: { equals: batchId } },
    sort: 'code',
    limit: 2000,
    depth: 2,
    overrideAccess: true,
  })

  if (result.totalDocs === 0) {
    return NextResponse.json({ error: 'No codes found for this batchId' }, { status: 404 })
  }

  const headersRow = [
    'code',
    'batchId',
    'product',
    'productVariant',
    'trial',
    'validDays',
    'versionFrom',
    'versionTo',
    'maxInstallations',
    'codeExpiresAt',
    'info',
    'createdAt',
  ]

  const lines = [headersRow.map(csvEscape).join(',')]

  for (const doc of result.docs as CsvCodeDoc[]) {
    lines.push(
      [
        doc.code,
        doc.batchId ?? '',
        relationLabel(doc.definition?.product ?? doc.product),
        relationLabel(doc.definition?.productVariant ?? doc.productVariant),
        (doc.definition?.trial ?? doc.trial) ? 'true' : 'false',
        doc.definition?.validDays ?? doc.validDays ?? '',
        doc.definition?.versionFrom ?? doc.versionFrom ?? '',
        doc.definition?.versionTo ?? doc.versionTo ?? '',
        doc.definition?.maxInstallations ?? doc.maxInstallations ?? '',
        doc.expiresAt ?? '',
        doc.info ?? doc.definition?.info ?? '',
        doc.createdAt ?? '',
      ]
        .map(csvEscape)
        .join(','),
    )
  }

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=activation-codes-${batchId}.csv`,
    },
  })
}
