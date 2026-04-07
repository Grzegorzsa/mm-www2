import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import GenericPage from '@/components/frontend/GenericPage'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const payload = await getPayload({ config: await config })
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    const page = result.docs[0]
    if (!page) return {}
    return buildMetadata(page.meta, {
      title: `${page.title} — MXbeats`,
    })
  } catch {
    return {}
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params

  let page: any = null
  try {
    const payload = await getPayload({ config: await config })
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    page = result.docs[0] ?? null
  } catch {
    notFound()
  }

  if (!page) notFound()

  return <GenericPage title={page.title} content={page.content} />
}
