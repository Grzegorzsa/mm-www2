import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '../payload.config'
import homepageData from './homepage.json'
import path from 'path'

const mediaDir = path.resolve(process.cwd(), 'media')

const exportedMediaFiles: Record<number, { filename: string; alt: string }> = {
  1: { filename: 'mx_beats_side01.jpg', alt: 'MX Beats Slide' },
  2: { filename: 'home-features-1.jpg', alt: 'MX Beats Feature 1' },
  3: { filename: 'home-features-2.jpg', alt: 'MX Beats Feature 2' },
  4: { filename: 'home-features-3.jpg', alt: 'MX Beats Feature 3' },
  5: { filename: 'home-features-4.jpg', alt: 'MX Beats Feature 4' },
  6: { filename: 'home-features-5.jpg', alt: 'MX Beats Feature 5' },
  8: { filename: 'mxgrid_intro-1.mp4', alt: 'MX Grid intro' },
}

const {
  id: _id,
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  globalType: _globalType,
  ...data
} = homepageData

async function ensureMedia(payload: Payload, filename: string, alt: string): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`  Media "${filename}" already exists (id=${existing.docs[0].id}) - skipping.`)
    return existing.docs[0].id as number
  }

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.join(mediaDir, filename),
  })

  console.log(`  Created media: ${filename} -> id=${doc.id}`)
  return doc.id as number
}

async function resolveExportedMediaId(payload: Payload, exportedId: number | null | undefined) {
  if (exportedId == null) return exportedId

  const mediaFile = exportedMediaFiles[exportedId]
  if (!mediaFile) {
    throw new Error(`Missing homepage media mapping for exported media id ${exportedId}.`)
  }

  return ensureMedia(payload, mediaFile.filename, mediaFile.alt)
}

async function resolveMediaRelations(payload: Payload) {
  return {
    ...data,
    hero: {
      ...data.hero,
      heroImage: await resolveExportedMediaId(payload, data.hero.heroImage),
    },
    features: await Promise.all(
      data.features.map(async (feature) => ({
        ...feature,
        image: await resolveExportedMediaId(payload, feature.image),
      })),
    ),
    timeline: {
      ...data.timeline,
      image: await resolveExportedMediaId(payload, data.timeline.image),
    },
    meta: {
      ...data.meta,
      image: await resolveExportedMediaId(payload, data.meta.image),
    },
  }
}

async function seed() {
  const payload = await getPayload({ config: await config })
  const seedData = await resolveMediaRelations(payload)

  await payload.updateGlobal({
    slug: 'homepage',
    data: seedData,
  })

  console.log('Homepage seeded.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
