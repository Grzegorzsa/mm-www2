'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type VariantKey = 'loops' | 'beats'

type PricingActionsProps = {
  loopsCheckoutUrl?: string
  beatsCheckoutUrl?: string
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

function appendAffiliateCode(url: string, affiliateCode: string | null): string {
  if (!url || !affiliateCode) return url

  try {
    const parsed = new URL(url)
    parsed.searchParams.set('checkout[custom][affiliate_code]', affiliateCode)
    return parsed.toString()
  } catch {
    return url
  }
}

export function PricingActions({
  loopsCheckoutUrl = '',
  beatsCheckoutUrl = '',
}: PricingActionsProps) {
  const [selectedVariant, setSelectedVariant] = useState<VariantKey | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)

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

  const variantCheckoutUrl = useMemo(() => {
    const urls: Record<VariantKey, string> = {
      loops: loopsCheckoutUrl,
      beats: beatsCheckoutUrl,
    }

    if (!selectedVariant) return ''
    return appendAffiliateCode(urls[selectedVariant], affiliateCode)
  }, [affiliateCode, beatsCheckoutUrl, loopsCheckoutUrl, selectedVariant])

  const modalMeta = selectedVariant ? variantMeta[selectedVariant] : null
  const checkoutEnabled = Boolean(variantCheckoutUrl)

  return (
    <>
      <tr>
        <th className="bg-[#fafafa] border border-white border-b-4 px-6 py-4" />
        <td className="bg-white border border-white border-b-4 text-center px-6 py-4">
          <Link
            href="/sign-up"
            className="inline-block bg-[#72cd78] text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-[#5ab360] transition-colors font-medium rounded"
          >
            Register
          </Link>
        </td>
        <td className="bg-white border border-white border-b-4 text-center px-6 py-4">
          <button
            type="button"
            onClick={() => {
              setSelectedVariant('loops')
              setAcceptedTerms(false)
            }}
            className="inline-block bg-[#3fbef2] text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-[#2da8d8] transition-colors font-medium rounded"
          >
            Buy
          </button>
        </td>
        <td className="bg-white border border-white border-b-4 text-center px-6 py-4">
          <button
            type="button"
            onClick={() => {
              setSelectedVariant('beats')
              setAcceptedTerms(false)
            }}
            className="inline-block bg-[#d800d0] text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-[#b200ab] transition-colors font-medium rounded"
          >
            Buy
          </button>
        </td>
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

                {!checkoutEnabled ? (
                  <p className="mt-4 text-sm text-red-700">
                    Checkout is not configured yet for this variant. Please set the Lemon Squeezy
                    checkout URL in environment variables.
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

                  <a
                    href={variantCheckoutUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-block text-white px-5 py-2 text-sm tracking-wider uppercase transition-colors font-medium rounded text-center ${modalMeta.buttonClass} ${!acceptedTerms || !checkoutEnabled ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => setSelectedVariant(null)}
                  >
                    Go to Checkout
                  </a>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}
