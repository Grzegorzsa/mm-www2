'use client'

import { useState } from 'react'
import type { OfferDebugEntry } from '@/lib/offersHelper'

export function OffersDebug({ entries }: { entries: OfferDebugEntry[] }) {
  const [open, setOpen] = useState(false)

  const accepted = entries.filter((e) => e.accepted).length
  const rejected = entries.filter((e) => !e.accepted).length

  return (
    <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left text-xs font-semibold text-gray-500 uppercase tracking-wider select-none cursor-pointer"
      >
        {open ? '▾' : '▸'} Dev: offer eligibility ({accepted} accepted, {rejected} rejected)
      </button>

      {open && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-200">
                <th className="pb-1 pr-3 font-medium">ID</th>
                <th className="pb-1 pr-3 font-medium">Offer</th>
                <th className="pb-1 pr-3 font-medium">Type</th>
                <th className="pb-1 pr-3 font-medium">Target</th>
                <th className="pb-1 pr-3 font-medium">Status</th>
                <th className="pb-1 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.offerId} className="border-b border-gray-100 last:border-0">
                  <td className="py-1 pr-3 text-gray-400">{entry.offerId}</td>
                  <td className="py-1 pr-3 text-gray-700">{entry.offerName}</td>
                  <td className="py-1 pr-3 text-gray-500">{entry.actionType}</td>
                  <td className="py-1 pr-3 text-gray-500">{entry.targetVariantName}</td>
                  <td className="py-1 pr-3">
                    {entry.accepted ? (
                      <span className="text-emerald-600 font-semibold">✓ shown</span>
                    ) : (
                      <span className="text-red-500 font-semibold">✗ hidden</span>
                    )}
                  </td>
                  <td className="py-1 text-gray-500">{entry.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
