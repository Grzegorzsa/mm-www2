import { getPayload } from 'payload'
import config from '../payload.config'
import privacyPolicyData from './privacy-policy.json'

async function seed() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: privacyPolicyData.slug } },
    limit: 1,
  })

  const data = {
    title: privacyPolicyData.title,
    slug: privacyPolicyData.slug,
    content: privacyPolicyData.content,
  } as any

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data,
    })

    console.log(`Updated page: ${privacyPolicyData.slug}`)
  } else {
    await payload.create({
      collection: 'pages',
      data,
    })

    console.log(`Created page: ${privacyPolicyData.slug}`)
  }

  console.log('Privacy policy seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
