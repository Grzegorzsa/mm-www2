import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import fallbackContent from '@/globals/pages/manual.json'
import './manual.css'

export const metadata: Metadata = {
  title: 'Manual — MX GRID by MXbeats',
  description:
    'Full documentation for MX GRID: installation, main panel, box editor, page editor, arranger, and project settings.',
}

export default async function ManualPage() {
  let manualData: any = null
  try {
    const payload = await getPayload({ config: await config })
    manualData = await payload.findGlobal({ slug: 'manual' })
  } catch (err) {
    console.error('[ManualPage] Failed to load CMS data, using fallback content:', err)
  }

  const manual = {
    aside: manualData?.aside || fallbackContent.aside,
    mobileToc: manualData?.mobileToc || fallbackContent.mobileToc,
    sections: manualData?.sections?.length ? manualData.sections : fallbackContent.sections,
  }

  return (
    <div className="manual">
      <div className="container">
        <aside dangerouslySetInnerHTML={{ __html: manual.aside }} />

        <div className="content">
          <div className="mobile-toc" dangerouslySetInnerHTML={{ __html: manual.mobileToc }} />

          {manual.sections.map((section: any, i: number) => (
            <section key={section.id ?? i} dangerouslySetInnerHTML={{ __html: section.html }} />
          ))}
        </div>
      </div>
    </div>
  )
}
