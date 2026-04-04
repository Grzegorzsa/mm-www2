import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import HomePage from './HomePage'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const payload = await getPayload({ config: await config })
    const homepage = await payload.findGlobal({ slug: 'homepage' })
    return buildMetadata(homepage?.meta, {
      title: 'MXbeats — Music Production and Arrangement Software',
      description:
        'MXbeats is an evolving music production platform for performance, arrangement, and sound design.',
    })
  } catch {
    return buildMetadata(null, {
      title: 'MXbeats — Music Production and Arrangement Software',
      description:
        'MXbeats is an evolving music production platform for performance, arrangement, and sound design.',
    })
  }
}

export default HomePage
