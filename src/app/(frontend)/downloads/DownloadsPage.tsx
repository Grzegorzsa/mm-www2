import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import fallbackContent from '@/globals/pages/downloads.json'
import { Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Downloads — MXbeats',
  description: 'Download MXbeats music looping software',
}

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

export default async function DownloadsPage() {
  let downloadsData: any = null
  try {
    const payload = await getPayload({ config: await config })
    downloadsData = await payload.findGlobal({ slug: 'downloads' })
  } catch (err) {
    console.error('[DownloadsPage] Failed to load CMS data, using fallback content:', err)
  }

  const introText: string = downloadsData?.intro?.text ?? fallbackContent.intro.text
  const introNote: string = downloadsData?.intro?.note ?? fallbackContent.intro.note
  const downloads: DownloadGroup[] = downloadsData?.downloads?.length
    ? downloadsData.downloads
    : fallbackContent.downloads

  return (
    <div className="bg-[#f3f3f3] min-h-[calc(100vh-320px)] flex items-center justify-center py-8">
      <div className="max-w-4xl mx-auto bg-white px-6 pt-6 pb-8 mt-0 mb-4 text-[#444]">
        <h1 className="text-3xl font-bold tracking-widest mb-6">Downloads</h1>

        <p className="mb-6 text-gray-600">{introText}</p>

        <div className="space-y-6">
          {downloads.map((group, groupIndex) => (
            <div key={group.id ?? groupIndex} className="border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-3">{group.title}</h2>
              <div className="space-y-3">
                {group.files.map((file, fileIndex) => (
                  <div
                    key={fileIndex}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 first:pt-0 first:border-t-0"
                  >
                    <div>
                      <p className="text-gray-700 text-sm">{file.description}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        {file.version && <span>v{file.version}</span>}
                        <span>{file.fileName}</span>
                        <span>{file.size}</span>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium whitespace-nowrap"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
          <strong>Note:</strong> {introNote}
        </div>
      </div>
    </div>
  )
}
