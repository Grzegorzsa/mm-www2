import { getPayload } from 'payload'
import config from '../payload.config'

async function removeRefundPolicy() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'refund-policy' } },
    limit: 1,
  })

  if (existing.docs.length === 0) {
    console.log('Refund policy page is already removed.')
    process.exit(0)
  }

  await payload.delete({
    collection: 'pages',
    id: existing.docs[0].id,
  })

  console.log('Removed page: refund-policy')
  process.exit(0)
}

removeRefundPolicy().catch((err) => {
  console.error(err)
  process.exit(1)
})
