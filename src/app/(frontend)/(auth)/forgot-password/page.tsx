import type { Metadata } from 'next'
import ForgotPasswordForm from './ForgotPasswordForm'
import ClientOnly from '@/components/ClientOnly'

export const metadata: Metadata = {
  title: 'Forgot Password — MXbeats',
}

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
      <p className="text-sm text-gray-500 mb-8">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>
      <ClientOnly>
        <ForgotPasswordForm />
      </ClientOnly>
    </>
  )
}
