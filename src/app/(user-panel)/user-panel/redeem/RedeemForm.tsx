'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'

export function RedeemForm() {
  const [code, setCode] = useState('')
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
        body: JSON.stringify({ code }),
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
        <div className="bg-green-50 border border-green-200 rounded p-3 text-green-700 text-sm">
          {success}
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
