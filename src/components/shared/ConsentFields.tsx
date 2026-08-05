'use client'

import Link from 'next/link'

type ConsentFieldsProps = {
  acceptedDelivery: boolean
  onDeliveryChange: (v: boolean) => void
  acceptedTerms: boolean
  onTermsChange: (v: boolean) => void
  marketingConsent: boolean
  onMarketingChange: (v: boolean) => void
  showMarketing: boolean
  className?: string
}

export function ConsentFields({
  acceptedDelivery,
  onDeliveryChange,
  acceptedTerms,
  onTermsChange,
  marketingConsent,
  onMarketingChange,
  showMarketing,
  className = '',
}: ConsentFieldsProps) {
  return (
    <div className={className}>
      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={acceptedDelivery}
          onChange={(e) => onDeliveryChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-400"
        />
        <span>
          I agree to immediate access/delivery of the digital content and acknowledge that upon
          delivery I lose my right of withdrawal / right to cancel the order.
        </span>
      </label>

      <label className="mt-3 flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-400"
        />
        <span>
          I accept the{' '}
          <Link href="/terms-and-conditions" className="underline" target="_blank">
            Terms and Conditions
          </Link>{' '}
          of the service operated by the Entrepreneurship Development Foundation &ldquo;Twój
          StartUp&rdquo; based in Warsaw.
        </span>
      </label>

      {showMarketing && (
        <label className="mt-3 flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => onMarketingChange(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-400"
          />
          <span>Inform me about promotions and updates</span>
        </label>
      )}

      <p className="mt-4 text-xs text-gray-500 leading-relaxed">
        The administrator of the personal data entered into the form is the Entrepreneurship
        Development Foundation &ldquo;Twój StartUp&rdquo; based in Warsaw. Data will be processed to
        fulfill the order and, if consent is given, for marketing purposes. You may withdraw your
        consent at any time. Full information regarding data processing and your rights can be found
        in our{' '}
        <Link href="/privacy-policy" className="underline hover:text-gray-700">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
