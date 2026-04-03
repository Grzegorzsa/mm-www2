import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'

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
    return {
      title: `${page.title} — MXbeats`,
      description: page.metaDescription ?? undefined,
    }
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

  return (
    <div className="bg-[#2d2d2d] min-h-[calc(100vh-320px)] pb-4">
      <div className="max-w-4xl mx-auto bg-[#5f686d] px-6 py-8 mb-4">
        <h1 className="text-3xl font-bold text-center tracking-widest mb-6">{page.title}</h1>
        <div className="prose prose-invert prose-headings:text-white prose-h3:text-orange-400 prose-h4:text-[#ffc57b] prose-a:text-white hover:prose-a:text-red-300 max-w-none">
          <RichText data={page.content} />
        </div>
      </div>
    </div>
  )
}
