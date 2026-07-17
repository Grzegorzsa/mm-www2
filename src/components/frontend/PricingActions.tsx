'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type VariantKey = 'loops' | 'beats'

export type VariantOffer = {
  targetVariantId: number
  referencePriceCents?: number
  actionLabel: string
  actionType: 'upgrade_replace' | 'crossgrade' | 'trial'
}

type PricingActionsProps = {
  loopsVariantId?: string
  beatsVariantId?: string
  sessionEmail?: string
  loopsOwned?: boolean
  beatsOwned?: boolean
  loopsOffer?: VariantOffer
  beatsOffer?: VariantOffer
}

const variantMeta: Record<VariantKey, { title: string; buttonClass: string; accentClass: string }> =
  {
    loops: {
      title: 'MX Grid Loops Pro',
      buttonClass: 'bg-[#3fbef2] hover:bg-[#2da8d8]',
      accentClass: 'text-[#3fbef2]',
    },
    beats: {
      title: 'MX Grid Beats',
      buttonClass: 'bg-[#d800d0] hover:bg-[#b200ab]',
      accentClass: 'text-[#d800d0]',
    },
  }

export function PricingActions({
  loopsVariantId = '',
  beatsVariantId = '',
  sessionEmail = '',
  loopsOwned = false,
  beatsOwned = false,
  loopsOffer,
  beatsOffer,
}: PricingActionsProps) {
  const [selectedVariant, setSelectedVariant] = useState<VariantKey | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)
  const [showPromoCode, setShowPromoCode] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [email, setEmail] = useState(sessionEmail)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setAffiliateCode(
      params.get('affiliate_code') || params.get('affiliateCode') || params.get('aff'),
    )
  }, [])

  useEffect(() => {
    if (!selectedVariant) return

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedVariant(null)
      }
    }

    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [selectedVariant])

  const modalMeta = selectedVariant ? variantMeta[selectedVariant] : null
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isLoggedIn = Boolean(sessionEmail)

  const variantIds: Record<VariantKey, string> = {
    loops: loopsVariantId,
    beats: beatsVariantId,
  }
  const owned: Record<VariantKey, boolean> = {
    loops: loopsOwned,
    beats: beatsOwned,
  }
  const offers: Record<VariantKey, VariantOffer | undefined> = {
    loops: loopsOffer,
    beats: beatsOffer,
  }
  const selectedVariantId = selectedVariant ? variantIds[selectedVariant] : ''
  const selectedOffer = selectedVariant ? offers[selectedVariant] : undefined

  function formatPrice(cents: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      cents / 100,
    )
  }

  function openModal(key: VariantKey) {
    setSelectedVariant(key)
    setAcceptedTerms(false)
    setCheckoutError(null)
    setShowPromoCode(false)
    setDiscountCode('')
    setMarketingConsent(false)
  }

  async function handleCheckout() {
    if (!selectedVariant) return

    setCheckoutError(null)
    setIsLoadingCheckout(true)

    try {
      if (!selectedVariantId) {
        throw new Error('Checkout is not configured yet for this variant.')
      }

      const isOfferCheckout = Boolean(selectedOffer)
      const response = await fetch(
        isOfferCheckout ? '/api/checkout/upgrade' : '/api/checkout/purchase',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isOfferCheckout
              ? {
                  variantId: selectedOffer?.targetVariantId,
                  discountCode: discountCode.trim() || undefined,
                  actionType: selectedOffer?.actionType,
                }
              : {
                  variantId: selectedVariantId,
                  affiliateCode,
                  discountCode: discountCode.trim() || undefined,
                  email: email || undefined,
                  marketingConsent,
                },
          ),
        },
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error ?? 'Could not initialize checkout')
      }

      const checkoutUrl = data?.checkoutUrl
      if (typeof checkoutUrl !== 'string' || !checkoutUrl) {
        throw new Error('Checkout URL is missing')
      }

      window.location.assign(checkoutUrl)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not start checkout'
      setCheckoutError(message)
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  return (
    <>
      <tr>
        <th className="bg-[#fafafa] border border-white border-b-4 px-6 py-4" />
        <td className="bg-white border border-white border-b-4 text-center px-6 py-4">
          {isLoggedIn ? (
            <button
              type="button"
              disabled
              className="inline-block bg-gray-300 text-gray-500 px-6 py-2 text-sm tracking-widest uppercase font-medium rounded cursor-not-allowed"
            >
              Included
            </button>
          ) : (
            <Link
              href="/sign-up"
              className="inline-block bg-[#72cd78] text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-[#5ab360] transition-colors font-medium rounded"
            >
              Register
            </Link>
          )}
        </td>
        {(['loops', 'beats'] as VariantKey[]).map((key) => {
          const meta = variantMeta[key]
          const offer = offers[key]
          const isOwned = owned[key]

          return (
            <td key={key} className="bg-white border border-white border-b-4 text-center px-6 py-4">
              {isOwned ? (
                <span className="inline-block text-sm text-gray-500 font-medium tracking-wide uppercase">
                  Owned
                </span>
              ) : offer ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 tracking-wide">
                    {offer.actionLabel} from {formatPrice(offer.referencePriceCents ?? 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => openModal(key)}
                    className={`inline-block ${meta.buttonClass} text-white px-6 py-2 text-sm tracking-widest uppercase transition-colors font-medium rounded`}
                  >
                    {offer.actionLabel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openModal(key)}
                  className={`inline-block ${meta.buttonClass} text-white px-6 py-2 text-sm tracking-widest uppercase transition-colors font-medium rounded`}
                >
                  Buy
                </button>
              )}
            </td>
          )
        })}
      </tr>

      {selectedVariant && modalMeta ? (
        <tr>
          <td colSpan={4} className="p-0">
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedVariant(null)}
              role="presentation"
            >
              <div
                className="w-full max-w-xl rounded-lg bg-white text-[#1f2428] shadow-2xl p-6"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pricing-checkout-title"
              >
                <h4
                  id="pricing-checkout-title"
                  className={`text-2xl font-semibold ${modalMeta.accentClass}`}
                >
                  Purchase {modalMeta.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[#3c4349]">
                  Continue to secure checkout. Before purchasing, please confirm that you reviewed
                  the legal terms and tested the software on your system.
                </p>

                {checkoutError && (
                  <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {checkoutError}
                  </p>
                )}

                <div className="mt-5">
                  <label className="block text-sm font-medium text-[#30363b] mb-2">
                    Email Address (for portal login)
                  </label>
                  {isLoggedIn ? (
                    <p className="text-sm text-[#3c4349] bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                      {sessionEmail}
                    </p>
                  ) : (
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#3fbef2]"
                    />
                  )}
                </div>

                <div className="mt-4">
                  {!showPromoCode ? (
                    <button
                      type="button"
                      onClick={() => setShowPromoCode(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#6b737c] hover:text-[#3c4349] transition-colors"
                    >
                      <span aria-hidden="true">+</span>
                      <span>Add promo code</span>
                    </button>
                  ) : (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                      <label className="block text-sm font-medium text-[#30363b] mb-2">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(event) => setDiscountCode(event.target.value)}
                        placeholder="Enter promo code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#3fbef2]"
                      />
                    </div>
                  )}
                </div>

                <label className="mt-5 flex items-start gap-3 text-sm text-[#30363b]">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(event) => setMarketingConsent(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-400"
                  />
                  <span>Inform me about promotions and updates</span>
                </label>

                <label className="mt-5 flex items-start gap-3 text-sm text-[#30363b]">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-400"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms-and-conditions" className="underline" target="_blank">
                      Terms and Conditions
                    </Link>{' '}
                    (including EULA) and{' '}
                    <Link href="/refund-policy" className="underline" target="_blank">
                      Refund Policy
                    </Link>
                    .
                  </span>
                </label>

                {!selectedVariantId ? (
                  <p className="mt-4 text-sm text-red-700">
                    Checkout is not configured yet for this variant. Please set the Lemon Squeezy
                    variant ID in the CMS.
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="inline-block border border-[#ced5db] text-[#2d3338] px-5 py-2 text-sm tracking-wider uppercase hover:bg-[#f4f6f8] transition-colors font-medium rounded"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      !acceptedTerms || !selectedVariantId || isLoadingCheckout || !isEmailValid
                    }
                    onClick={handleCheckout}
                    className={`inline-block text-white px-5 py-2 text-sm tracking-wider uppercase transition-colors font-medium rounded text-center ${modalMeta.buttonClass} ${!acceptedTerms || !selectedVariantId || isLoadingCheckout || !isEmailValid ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {isLoadingCheckout ? 'Preparing...' : 'Go to Checkout'}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}
