import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '../payload.config'

async function getProductId(payload: Payload, uid: string): Promise<number> {
  const { docs } = await payload.find({
    collection: 'products',
    where: { uid: { equals: uid } },
    limit: 1,
  })
  if (!docs[0]) throw new Error(`Product not found: ${uid}`)
  return docs[0].id as number
}

async function seed() {
  const payload = await getPayload({ config: await config })

  const mxGridId = await getProductId(payload, 'mx-grid')

  const variants = [
    {
      name: 'Developer',
      uid: 'mx-grid-dev',
      description: 'Developer',
      product: mxGridId,
    },
    {
      name: 'Elements',
      uid: 'mx-grid-elements',
      description: 'Loops Elements',
      product: mxGridId,
    },
    {
      name: 'Loops',
      uid: 'mx-grid-loops',
      description: 'Loops Pro',
      product: mxGridId,
    },
    {
      name: 'Loops SE',
      uid: 'mx-grid-loops-se',
      description: 'Loops SE (Standalone Edition)',
      product: mxGridId,
    },
    {
      name: 'Tester',
      uid: 'mx-grid-tester',
      description: 'Tester',
      product: mxGridId,
    },
  ]

  for (const variant of variants) {
    const existing = await payload.find({
      collection: 'product-variants',
      where: { uid: { equals: variant.uid } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'product-variants',
        id: existing.docs[0].id,
        data: variant as any,
      })
      console.log(`Updated product variant: ${variant.uid}`)
    } else {
      await payload.create({
        collection: 'product-variants',
        data: variant as any,
      })
      console.log(`Created product variant: ${variant.uid}`)
    }
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
