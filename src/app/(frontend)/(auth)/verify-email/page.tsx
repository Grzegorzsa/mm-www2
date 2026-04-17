import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata: Metadata = {
  title: 'Verify Email — MXbeats',
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
        <p className="text-gray-600 mb-6">
          This verification link is invalid or has already been used.
        </p>
        <a href="/sign-in" className="text-black underline text-sm">
          Go to sign in
        </a>
      </div>
    )
  }

  let success = false
  let errorMessage = 'Verification failed. The link may have expired or already been used.'

  try {
    const payload = await getPayload({ config })
    await payload.verifyEmail({ collection: 'users', token })
    success = true
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage = err.message
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-green-50 border border-green-200 rounded p-8 text-green-800">
          <h1 className="text-2xl font-bold mb-2">Email Verified</h1>
          <p className="mb-6">Your email address has been confirmed. You can now sign in.</p>
          <a
            href="/sign-in"
            className="inline-block bg-black text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="bg-red-50 border border-red-200 rounded p-8 text-red-800">
        <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
        <p className="mb-6">{errorMessage}</p>
        <a href="/sign-up" className="text-black underline text-sm">
          Register again
        </a>
      </div>
    </div>
  )
}
