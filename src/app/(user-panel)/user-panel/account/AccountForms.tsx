'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 mb-4   max-w-xl">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function inputClass(hasError?: boolean) {
  return `block border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-full ${hasError ? 'border-red-400' : 'border-gray-300'}`
}

export default function AccountForms({
  userId,
  initialMarketing,
}: {
  userId: number
  initialMarketing: boolean
}) {
  // --- Marketing consent ---
  const [marketing, setMarketing] = useState(initialMarketing)
  const [marketingLoading, setMarketingLoading] = useState(false)
  const [marketingSaved, setMarketingSaved] = useState(false)

  const handleMarketingChange = async (checked: boolean) => {
    setMarketing(checked)
    setMarketingLoading(true)
    setMarketingSaved(false)
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ marketingConsent: checked }),
      })
      setMarketingSaved(true)
      setTimeout(() => setMarketingSaved(false), 2500)
    } finally {
      setMarketingLoading(false)
    }
  }

  // --- Change password ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})
  const [pwLoading, setPwLoading] = useState(false)
  const [pwServerError, setPwServerError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const validatePw = () => {
    const e: Record<string, string> = {}
    if (!currentPassword) e.currentPassword = 'Current password is required'
    if (newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters'
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handlePasswordSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validatePw()
    setPwErrors(e)
    if (Object.keys(e).length > 0) return

    setPwLoading(true)
    setPwServerError('')
    setPwSuccess(false)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, password: newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.message ?? data?.message ?? 'Password update failed')
      }
      setPwSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      setPwServerError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <>
      {/* Marketing consent */}
      <SectionCard title="Communication Preferences">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={marketing}
            disabled={marketingLoading}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleMarketingChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-black cursor-pointer"
          />
          <span className="text-sm text-gray-700">Inform me about promotions and updates</span>
        </label>
        {marketingSaved && <p className="text-xs text-green-600 mt-2">Preferences saved.</p>}
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Change Password">
        {pwSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm mb-4">
            Password updated successfully.
          </div>
        )}
        {pwServerError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
            {pwServerError}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm text-gray-700 mb-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
              className={inputClass(!!pwErrors.currentPassword)}
              autoComplete="current-password"
            />
            {pwErrors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              className={inputClass(!!pwErrors.newPassword)}
              autoComplete="new-password"
            />
            {pwErrors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              className={inputClass(!!pwErrors.confirmPassword)}
              autoComplete="new-password"
            />
            {pwErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{pwErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            className="bg-black text-white px-6 py-2 text-sm tracking-widest uppercase rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pwLoading ? 'Saving…' : 'Update Password'}
          </button>
        </form>
      </SectionCard>
    </>
  )
}
