import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/session'
import AccountForms from './AccountForms'

export const metadata: Metadata = { title: 'My Account — MXbeats' }

export default async function AccountPage() {
  const user = await getSessionUser()
  if (!user) return null

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">My Account</h1>
      <p className="text-sm text-gray-500 mb-8">{user.email}</p>

      <AccountForms userId={user.id} initialMarketing={user.marketingConsent ?? false} />
    </div>
  )
}
