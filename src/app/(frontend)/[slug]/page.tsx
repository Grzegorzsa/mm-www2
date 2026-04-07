import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import GenericPage from '@/components/frontend/GenericPage'
import ContactForm from '../contact/ContactForm'

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
      description: page.meta?.description ?? undefined,
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

  // Handle contact page with form
  if (page.pageType === 'contact') {
    return (
      <div className="bg-white min-h-[calc(100vh-320px)]">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-4xl md:text-5xl font-bold tracked-wide">{page.title}</h1>
          </div>
        </div>

        {/* Contact form section */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
          <ContactForm />
        </div>
      </div>
    )
  }

  // Handle policy and generic pages
  return <GenericPage title={page.title} content={page.content} />
}
