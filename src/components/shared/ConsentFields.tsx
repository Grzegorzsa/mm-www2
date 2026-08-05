'use client'

import Link from 'next/link'
import { LEGAL_CONSENT_TEXT } from '@/lib/legalConsentText'

type ConsentFieldsProps = {
  acceptedDelivery?: boolean
  onDeliveryChange?: (v: boolean) => void
  showDelivery?: boolean
  acceptedTerms: boolean
  onTermsChange: (v: boolean) => void
  marketingConsent?: boolean
  onMarketingChange?: (v: boolean) => void
  showMarketing?: boolean
  showPrivacyNotice?: boolean
  className?: string
}

export function ConsentFields({
  acceptedDelivery = false,
  onDeliveryChange,
  showDelivery = true,
  acceptedTerms,
  onTermsChange,
  marketingConsent = false,
  onMarketingChange,
  showMarketing = false,
  showPrivacyNotice = true,
  className = '',
}: ConsentFieldsProps) {
  return (
    <div className={className}>
      {showDelivery && (
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={acceptedDelivery}
            onChange={(e) => onDeliveryChange?.(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-400"
          />
          <span>{LEGAL_CONSENT_TEXT.deliveryConsent}</span>
        </label>
      )}

      <label className="mt-3 flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-400"
        />
        <span>
          {LEGAL_CONSENT_TEXT.termsPrefix}{' '}
          <Link href="/terms-and-conditions" className="underline" target="_blank">
            {LEGAL_CONSENT_TEXT.termsLinkLabel}
          </Link>{' '}
          {LEGAL_CONSENT_TEXT.termsSuffix}
        </span>
      </label>

      {showMarketing && (
        <label className="mt-3 flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => onMarketingChange?.(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-400"
          />
          <span>{LEGAL_CONSENT_TEXT.marketingConsent}</span>
        </label>
      )}

      {showPrivacyNotice && (
        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          {LEGAL_CONSENT_TEXT.privacyNotice}{' '}
          <Link href="/privacy-policy" className="underline hover:text-gray-700">
            {LEGAL_CONSENT_TEXT.privacyPolicyLabel}
          </Link>
          .
        </p>
      )}
    </div>
  )
}
