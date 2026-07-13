'use client'

import Link from 'next/link'
import { useState, type ChangeEvent, type FormEvent } from 'react'

export function RedeemForm() {
  const [code, setCode] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/redeem/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, marketingConsent }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error ?? 'Redeem failed')
      }

      setSuccess(data?.message ?? 'Activation code redeemed successfully.')
      setCode('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Redeem failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-lg space-y-4">
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900">
          <p className="text-lg font-semibold mb-2">Activation successful</p>
          <p className="text-sm leading-relaxed text-green-900/90">{success}</p>
          <div className="mt-4 space-y-2 text-sm leading-relaxed text-green-900/90">
            <p>Next steps:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Go to your user panel to manage your licenses</li>
              <li>Download the software and updates</li>
              <li>Open the manual for product registration instructions</li>
            </ul>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/downloads"
              className="inline-block bg-black text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium rounded"
            >
              Downloads
            </Link>
            <Link
              href="/manual#product-registration"
              className="inline-block border border-green-300 bg-white px-5 py-2 text-xs tracking-widest uppercase text-green-900 hover:bg-green-100 transition-colors font-medium rounded"
            >
              Manual
            </Link>
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
          Activation Code <span className="text-red-500">*</span>
        </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black border-gray-300 uppercase"
          autoComplete="off"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setMarketingConsent(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-black cursor-pointer"
        />
        <span className="text-sm text-gray-700">Inform me about promotions and updates</span>
      </label>

      <button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="inline-block bg-black text-white px-5 py-2 text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors font-medium rounded disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Redeeming…' : 'Redeem Code'}
      </button>
    </form>
  )
}
