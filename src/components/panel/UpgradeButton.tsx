'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type UpgradeButtonProps = {
  variantId: number
  label?: string
  className?: string
  isTrial?: boolean
  offerActionType?: 'upgrade_replace' | 'crossgrade' | 'trial'
}

export function UpgradeButton({
  variantId,
  label = 'Upgrade',
  className,
  isTrial = false,
  offerActionType,
}: UpgradeButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPromoCode, setShowPromoCode] = useState(false)
  const [discountCode, setDiscountCode] = useState('')

  async function handleUpgrade() {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout/upgrade', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          discountCode: discountCode.trim() || undefined,
          actionType: offerActionType,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error ?? 'Could not initialize checkout')
      }

      if (data?.trial) {
        router.refresh()
        return
      }

      const checkoutUrl = data?.checkoutUrl
      if (typeof checkoutUrl !== 'string' || !checkoutUrl) {
        throw new Error('Checkout URL is missing')
      }

      window.location.assign(checkoutUrl)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not start upgrade checkout'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4">
      {!isTrial && (
        <>
          {!showPromoCode ? (
            <button
              type="button"
              onClick={() => setShowPromoCode(true)}
              className="mb-3 flex w-fit items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span aria-hidden="true">+</span>
              <span>Add promo code</span>
            </button>
          ) : (
            <div className="mb-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Promo Code</label>
              <input
                type="text"
                value={discountCode}
                onChange={(event) => setDiscountCode(event.target.value)}
                placeholder="Enter promo code"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              />
            </div>
          )}
        </>
      )}
      <div className="mt-1">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleUpgrade}
          className={
            className ||
            'inline-block bg-black text-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed'
          }
        >
          {isLoading ? 'Activating...' : label}
        </button>
      </div>

      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  )
}
