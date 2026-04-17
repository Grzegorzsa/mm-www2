'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!isValidEmail(email)) {
      setError('A valid email address is required')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      // Always show success to prevent email enumeration
      await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setSent(true) // still show success
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-6 text-green-800 text-center">
        <p className="text-lg font-semibold mb-1">Check your inbox</p>
        <p>
          If an account exists for <strong>{email}</strong>, we sent a password reset link.
        </p>
        <p className="text-sm mt-3 text-green-600">The link expires in 1 hour.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 text-gray-800">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-400' : 'border-gray-300'}`}
          autoComplete="email"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending…' : 'Send Reset Link'}
      </button>

      <p className="text-center text-sm text-gray-500">
        <a href="/sign-in" className="text-black underline hover:no-underline">
          Back to sign in
        </a>
      </p>
    </form>
  )
}
