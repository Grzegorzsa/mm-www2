import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import fallbackContent from '@/globals/pages/downloads.json'
import { Download } from 'lucide-react'

export const metadata: Metadata = { title: 'Downloads — MXbeats' }

type DownloadFile = {
  description: string
  version?: string
  fileName: string
  size: string
  url: string
}

type DownloadGroup = {
  id?: string
  title: string
  files: DownloadFile[]
}

export default async function PanelDownloadsPage() {
  let rawDownloads: DownloadGroup[] | undefined
  try {
    const payload = await getPayload({ config })
    const data = await payload.findGlobal({ slug: 'downloads' })
    rawDownloads = (data as { downloads?: DownloadGroup[] }).downloads
  } catch {
    // fall through to fallback
  }

  const downloads: DownloadGroup[] = rawDownloads?.length
    ? rawDownloads
    : (fallbackContent.downloads as DownloadGroup[])

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Downloads</h1>
      <p className="text-sm text-gray-500 mb-8">Download your licensed software</p>

      <div className="space-y-4 max-w-3xl">
        {downloads.map((group, groupIndex) => (
          <div
            key={group.id ?? groupIndex}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-3">{group.title}</h2>
            <div className="space-y-3">
              {group.files.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 first:pt-0 first:border-t-0"
                >
                  <div>
                    <p className="text-sm text-gray-700">
                      {file.description} <span className="text-gray-400">({file.size})</span>
                    </p>
                    <div className="flex gap-4 mt-0.5 text-xs text-gray-400">
                      <span>{file.fileName}</span>
                      {file.version && <span>ver: {file.version}</span>}
                    </div>
                  </div>
                  <a
                    href={file.url}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium whitespace-nowrap rounded-lg"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
