import { getPayload } from 'payload'
import config from '@payload-config'
import { DEFAULT_BANNED_DOMAINS } from '@/lib/bannedDomains'

async function seedBannedDomains() {
  const payload = await getPayload({ config })
  let created = 0

  for (const domain of DEFAULT_BANNED_DOMAINS) {
    const existing = await payload.find({
      collection: 'banned-domains',
      where: { domain: { equals: domain } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      continue
    }

    await payload.create({
      collection: 'banned-domains',
      data: { domain },
      overrideAccess: true,
    })

    created++
  }

  console.log(
    `Banned domains seed finished. Created: ${created}, total defaults: ${DEFAULT_BANNED_DOMAINS.length}`,
  )
}

void seedBannedDomains()
