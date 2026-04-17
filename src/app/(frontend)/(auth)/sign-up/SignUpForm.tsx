'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { h } from '@/lib/h'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!isValidEmail(email)) e.email = 'A valid email address is required'
    if (password.length < 8) e.password = 'Password must be at least 8 characters'
    if (password !== passwordConfirm) e.passwordConfirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setIsLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, scs: h(email) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error ?? data?.errors?.[0]?.message ?? 'Registration failed')
      }
      setSent(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred, please try again'
      setServerError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-6 text-green-800 text-center">
        <p className="text-lg font-semibold mb-1">Check your inbox</p>
        <p>
          We sent a verification email to <strong>{email}</strong>. Click the link inside to
          activate your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 text-gray-800">
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
          autoComplete="email"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
          autoComplete="new-password"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordConfirm(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${errors.passwordConfirm ? 'border-red-400' : 'border-gray-300'}`}
          autoComplete="new-password"
        />
        {errors.passwordConfirm && (
          <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
