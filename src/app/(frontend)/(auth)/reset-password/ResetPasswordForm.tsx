'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
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
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.message ?? data?.message ?? 'Password reset failed')
      }
      setDone(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred, please try again'
      setServerError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-6 text-green-800 text-center">
        <p className="text-lg font-semibold mb-1">Password updated</p>
        <p className="mb-4">Your password has been changed successfully.</p>
        <a
          href="/sign-in"
          className="inline-block bg-black text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors"
        >
          Sign In
        </a>
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
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password <span className="text-red-500">*</span>
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
          Confirm New Password <span className="text-red-500">*</span>
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
        {isLoading ? 'Updating…' : 'Set New Password'}
      </button>
    </form>
  )
}
