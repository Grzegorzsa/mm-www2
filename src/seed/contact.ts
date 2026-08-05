import { getPayload } from 'payload'
import config from '../payload.config'
import contactData from './contact.json'

async function seed() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: contactData.slug } },
    limit: 1,
  })

  const data = {
    title: contactData.title,
    slug: contactData.slug,
    content: contactData.content,
  } as any

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data,
    })

    console.log(`Updated page: ${contactData.slug}`)
  } else {
    await payload.create({
      collection: 'pages',
      data,
    })

    console.log(`Created page: ${contactData.slug}`)
  }

  console.log('Contact seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
