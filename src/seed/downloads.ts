import { getPayload } from 'payload'
import config from '../payload.config'
import downloadsData from '../globals/pages/downloads.json'

async function seed() {
  const payload = await getPayload({ config: await config })

  await payload.updateGlobal({
    slug: 'downloads',
    data: {
      intro: {
        text: downloadsData.intro.text,
        note: downloadsData.intro.note,
      },
      downloads: downloadsData.downloads.map((group) => ({
        title: group.title,
        files: group.files.map((file) => ({
          description: file.description,
          version: file.version,
          fileName: file.fileName,
          size: file.size,
          url: file.url,
        })),
      })),
      meta: {
        title: downloadsData.meta.title,
        description: downloadsData.meta.description,
        image: downloadsData.meta.image?.id ?? null,
      },
    },
  })

  console.log('Downloads global seeded successfully.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
