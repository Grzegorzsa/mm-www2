import { getPayload } from 'payload'
import config from '@payload-config'

async function backfillLicenseUserEmail() {
  const payload = await getPayload({ config })
  let page = 1
  let updated = 0

  while (true) {
    const result = await payload.find({
      collection: 'licenses',
      page,
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    for (const license of result.docs as Array<Record<string, unknown>>) {
      const userValue = license.user
      const userId =
        typeof userValue === 'object' && userValue !== null
          ? (userValue as { id?: string | number }).id
          : userValue

      if (!userId) {
        continue
      }

      let email = ''
      try {
        const user = (await payload.findByID({
          collection: 'users',
          id: userId as string | number,
          depth: 0,
          overrideAccess: true,
        })) as { email?: unknown }

        if (typeof user.email === 'string') {
          email = user.email
        }
      } catch {
        continue
      }

      if (email && license.userEmail !== email) {
        await payload.update({
          collection: 'licenses',
          id: license.id as string | number,
          data: { userEmail: email },
          overrideAccess: true,
        })
        updated++
      }
    }

    if (page >= result.totalPages) {
      break
    }

    page++
  }

  console.log(`Backfill finished. Updated licenses: ${updated}`)
}

void backfillLicenseUserEmail()
