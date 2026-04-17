import type { Metadata } from 'next'
import SignUpForm from './SignUpForm'

export const metadata: Metadata = {
  title: 'Create Account — MXbeats',
  description: 'Create your MXbeats account',
}

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
      <p className="text-sm text-gray-500 mb-8">
        Already have an account?{' '}
        <a href="/sign-in" className="text-black underline hover:no-underline">
          Sign in
        </a>
      </p>
      <SignUpForm />
    </>
  )
}
