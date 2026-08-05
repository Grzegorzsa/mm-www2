import { getPayload } from 'payload'
import config from '../payload.config'
import cookiePolicyData from './cookie-policy.json'

async function seed() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: cookiePolicyData.slug } },
    limit: 1,
  })

  const data = {
    title: cookiePolicyData.title,
    slug: cookiePolicyData.slug,
    content: cookiePolicyData.content,
  } as any

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data,
    })

    console.log(`Updated page: ${cookiePolicyData.slug}`)
  } else {
    await payload.create({
      collection: 'pages',
      data,
    })

    console.log(`Created page: ${cookiePolicyData.slug}`)
  }

  console.log('Cookie policy seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
