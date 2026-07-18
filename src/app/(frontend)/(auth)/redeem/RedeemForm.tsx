'use client'

import Link from 'next/link'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { h } from '@/lib/h'

type PreviewPayload = {
  valid: boolean
  activationCode: {
    code: string
    productName: string | null
    productVariantName: string | null
    expiresAt: string | null
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function RedeemForm() {
  const [activationCode, setActivationCode] = useState('')
  const [preview, setPreview] = useState<PreviewPayload | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  const [email, setEmail] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateRegistration = () => {
    const errors: Record<string, string> = {}
    if (!isValidEmail(email)) errors.email = 'A valid email address is required'
    if (!acceptedTerms)
      errors.acceptedTerms = 'You must accept Terms and Conditions and Refund Policy'
    return errors
  }

  async function handlePreview(ev: FormEvent) {
    ev.preventDefault()
    setPreviewError('')
    setSubmitError('')
    setIsChecking(true)

    try {
      const res = await fetch('/api/redeem/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: activationCode }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error ?? 'Activation code validation failed')
      }

      setPreview(data as PreviewPayload)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Activation code validation failed'
      setPreviewError(message)
      setPreview(null)
    } finally {
      setIsChecking(false)
    }
  }

  async function handleRedeem(ev: FormEvent) {
    ev.preventDefault()
    setSubmitError('')

    const formErrors = validateRegistration()
    if (Object.keys(formErrors).length > 0) {
      setSubmitError(Object.values(formErrors)[0] ?? 'Please check your input')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/redeem/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activationCode,
          email,
          marketingConsent,
          acceptedTerms,
          scs: h(email),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error ?? 'Redeem failed')
      }

      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Redeem failed'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900">
        <p className="text-lg font-semibold mb-2">Activation successful</p>
        <p className="text-sm leading-relaxed text-green-900/90">
          Your account is ready and your license has been added. An activation password has been
          sent to <strong>{email}</strong>. Use this password to sign in to both your user panel and
          the desktop application.
        </p>

        <div className="mt-4 space-y-2 text-sm leading-relaxed text-green-900/90">
          <p>You can now:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sign in to your user panel</li>
            <li>Download the software and updates</li>
            <li>Read the product registration guide in the manual</li>
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className="inline-block bg-black text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium rounded"
          >
            Sign In
          </Link>
          <Link
            href="/downloads"
            className="inline-block border border-green-300 bg-white px-5 py-2 text-xs tracking-widest uppercase text-green-900 hover:bg-green-100 transition-colors font-medium rounded"
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
    )
  }

  return (
    <div className="space-y-5 text-gray-800">
      <form onSubmit={handlePreview} className="space-y-3" noValidate>
        {previewError ? (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
            {previewError}
          </div>
        ) : null}

        <div>
          <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700 mb-1">
            Activation Code <span className="text-red-500">*</span>
          </label>
          <input
            id="activationCode"
            type="text"
            value={activationCode}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setActivationCode(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black border-gray-300 uppercase"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={isChecking || !activationCode.trim()}
          className="w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isChecking ? 'Checking code…' : 'Validate Code'}
        </button>
      </form>

      {preview?.valid ? (
        <div className="border border-gray-200 rounded p-4 space-y-4">
          <div className="text-sm text-gray-700">
            <p>
              Product: <strong>{preview.activationCode.productName ?? 'N/A'}</strong>
            </p>
            <p>
              Variant: <strong>{preview.activationCode.productVariantName ?? 'N/A'}</strong>
            </p>
          </div>

          <form onSubmit={handleRedeem} className="space-y-4" noValidate>
            {submitError ? (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
                {submitError}
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black border-gray-300"
                autoComplete="email"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none rounded border border-gray-200 bg-gray-50 px-3 py-2">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setMarketingConsent(e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 accent-black cursor-pointer"
              />
              <span className="text-sm text-gray-700">Inform me about promotions and updates</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none rounded border border-gray-200 bg-gray-50 px-3 py-2">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-black cursor-pointer"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Redeeming…' : 'Create Account and Redeem'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
