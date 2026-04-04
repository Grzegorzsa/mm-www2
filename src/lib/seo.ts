import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

interface PayloadSeoMeta {
  title?: string | null
  description?: string | null
  image?: (number | null) | Media
}

const SITE_NAME = 'MXbeats'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mxbeats.com'

/**
 * Convert Payload CMS SEO plugin meta into Next.js Metadata (including Open Graph & Twitter).
 */
export function buildMetadata(
  meta: PayloadSeoMeta | undefined | null,
  fallback?: { title?: string; description?: string },
): Metadata {
  const title = meta?.title || fallback?.title || SITE_NAME
  const description = meta?.description || fallback?.description || undefined

  let ogImage: string | undefined
  if (meta?.image && typeof meta.image === 'object' && meta.image.url) {
    ogImage = meta.image.url.startsWith('http') ? meta.image.url : `${SITE_URL}${meta.image.url}`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}
