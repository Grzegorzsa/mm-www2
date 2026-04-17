import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Installations — MXbeats' }

export default function InstallationsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Installations</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage your active installations &mdash; up to 2 per account.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-400 text-sm">No active installations.</p>
      </div>
    </div>
  )
}
