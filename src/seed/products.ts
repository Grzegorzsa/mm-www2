import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '../payload.config'
import path from 'path'

const mediaDir = path.resolve(process.cwd(), 'media')

async function ensureMedia(payload: Payload, filename: string, alt: string): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`  Media "${filename}" already exists (id=${existing.docs[0].id}) — skipping.`)
    return existing.docs[0].id as number
  }

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.join(mediaDir, filename),
  })
  console.log(`  Created media: ${filename} → id=${doc.id}`)
  return doc.id as number
}

async function seed() {
  const payload = await getPayload({ config: await config })

  const thumbId = await ensureMedia(payload, 'mx-grid-thumb.jpg', 'MX GRID')

  const products = [
    {
      name: 'MX GRID',
      uid: 'mx-grid',
      version: '1.2.0',
      versionNo: 1,
      releasedAt: '2024-08-06T12:00:00.000Z',
      releaseUpdatedAt: '2026-04-19T12:00:00.000Z',
      description:
        'Compose entire songs with built-in timeline editor. Arrange loops and samples creating cohesive musical pieces.',
      thumb: thumbId,
    },
  ]

  for (const product of products) {
    const existing = await payload.find({
      collection: 'products',
      where: { uid: { equals: product.uid } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'products',
        id: existing.docs[0].id,
        data: product as any,
      })
      console.log(`Updated product: ${product.uid}`)
    } else {
      await payload.create({
        collection: 'products',
        data: product as any,
      })
      console.log(`Created product: ${product.uid}`)
    }
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
