'use client'

import { useState } from 'react'

type UpgradeButtonProps = {
  variantId: number
  label?: string
  className?: string
}

export function UpgradeButton({ variantId, label = 'Upgrade', className }: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpgrade() {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout/upgrade', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error ?? 'Could not initialize checkout')
      }

      const checkoutUrl = data?.checkoutUrl
      if (typeof checkoutUrl !== 'string' || !checkoutUrl) {
        throw new Error('Checkout URL is missing')
      }

      window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not start upgrade checkout'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={isLoading}
        onClick={handleUpgrade}
        className={
          className ||
          'inline-block bg-black text-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed'
        }
      >
        {isLoading ? 'Preparing...' : label}
      </button>

      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  )
}
