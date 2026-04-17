import type { Metadata } from 'next'
import SignInForm from './SignInForm'

export const metadata: Metadata = {
  title: 'Sign In — MXbeats',
  description: 'Sign in to your MXbeats account',
}

export default function SignInPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
      <p className="text-sm text-gray-500 mb-8">
        Don&apos;t have an account?{' '}
        <a href="/sign-up" className="text-black underline hover:no-underline">
          Create one
        </a>
      </p>
      <SignInForm />
    </>
  )
}
