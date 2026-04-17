import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Purchases — MXbeats' }

export default function PurchasesPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Purchases</h1>
      <p className="text-sm text-gray-500 mb-8">Your purchase history</p>

      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-400 text-sm">No purchases yet.</p>
      </div>
    </div>
  )
}
