import type { Metadata } from 'next'
import ResetPasswordForm from './ResetPasswordForm'
import ClientOnly from '@/components/ClientOnly'

export const metadata: Metadata = {
  title: 'Set New Password — MXbeats',
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-gray-700 mb-4">Invalid or missing reset link.</p>
        <a href="/forgot-password" className="text-black underline text-sm">
          Request a new reset link
        </a>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
      <p className="text-sm text-gray-500 mb-8">Choose a strong password for your account.</p>
      <ClientOnly>
        <ResetPasswordForm token={token} />
      </ClientOnly>
    </>
  )
}
