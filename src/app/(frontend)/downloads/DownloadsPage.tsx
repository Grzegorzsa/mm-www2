import type { Metadata } from 'next'
import { Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Downloads — MXbeats',
  description: 'Download MXbeats music looping software',
}

const downloads = [
  {
    name: 'MXbeats Essentials (Windows)',
    description: 'Free standalone version for Windows 10/11 (64-bit)',
    version: 'Latest',
    size: '—',
    href: '#',
  },
]

export default function DownloadsPage() {
  return (
    <div className="bg-[#f3f3f3] min-h-[calc(100vh-320px)] pb-8">
      <div className="max-w-4xl mx-auto bg-white px-6 pt-6 pb-8 mt-0 mb-4 text-[#444]">
        <h1 className="text-3xl font-bold tracking-widest mb-6">Downloads</h1>

        <p className="mb-6 text-gray-600">
          Download the latest version of MXbeats. Create a free account to access all available
          downloads and manage your licenses.
        </p>

        <div className="space-y-4">
          {downloads.map((item) => (
            <div
              key={item.name}
              className="border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>Version: {item.version}</span>
                  {item.size !== '—' && <span>Size: {item.size}</span>}
                </div>
              </div>
              <a
                href={item.href}
                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium whitespace-nowrap"
              >
                <Download size={16} />
                Download
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
          <strong>Note:</strong> You need a free account to download and activate MXbeats. &nbsp;
          <a href="/register" className="underline hover:text-blue-600">
            Register here
          </a>{' '}
          — it&apos;s free and takes less than a minute.
        </div>
      </div>
    </div>
  )
}
