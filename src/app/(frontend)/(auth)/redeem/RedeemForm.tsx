'use client'

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
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateRegistration = () => {
    const errors: Record<string, string> = {}
    if (!isValidEmail(email)) errors.email = 'A valid email address is required'
    if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (password !== passwordConfirm) errors.passwordConfirm = 'Passwords do not match'
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
          password,
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
      <div className="bg-green-50 border border-green-200 rounded p-6 text-green-800 text-center">
        <p className="text-lg font-semibold mb-1">Activation successful</p>
        <p className="mb-4">Verify your email address and then sign in to access your license.</p>
        <a
          href="/sign-in"
          className="inline-block bg-black text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium rounded"
        >
          Sign In
        </a>
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black border-gray-300"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordConfirm(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black border-gray-300"
                autoComplete="new-password"
              />
            </div>

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
