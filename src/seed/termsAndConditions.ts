import { getPayload } from 'payload'
import config from '../payload.config'
import termsAndConditionsData from './terms-and-conditions.json'

async function seed() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: termsAndConditionsData.slug } },
    limit: 1,
  })

  const data = {
    title: termsAndConditionsData.title,
    slug: termsAndConditionsData.slug,
    content: termsAndConditionsData.content,
  } as any

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data,
    })

    console.log(`Updated page: ${termsAndConditionsData.slug}`)
  } else {
    await payload.create({
      collection: 'pages',
      data,
    })

    console.log(`Created page: ${termsAndConditionsData.slug}`)
  }

  console.log('Terms and Conditions seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
