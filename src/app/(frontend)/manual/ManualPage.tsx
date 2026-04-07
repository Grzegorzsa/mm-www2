import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import './manual.css'

export const metadata: Metadata = {
  title: 'Manual — MX GRID by MXbeats',
  description:
    'Full documentation for MX GRID: installation, main panel, box editor, page editor, arranger, and project settings.',
}

export default async function ManualPage() {
  const payload = await getPayload({ config: await config })
  const manual = await payload.findGlobal({ slug: 'manual' })

  return (
    <div className="manual">
      <div className="container">
        <aside dangerouslySetInnerHTML={{ __html: manual.aside }} />

        <div className="content">
          <div className="mobile-toc" dangerouslySetInnerHTML={{ __html: manual.mobileToc }} />

          {manual.sections.map((section, i) => (
            <section key={section.id ?? i} dangerouslySetInnerHTML={{ __html: section.html }} />
          ))}
        </div>
      </div>
    </div>
  )
}
