import type { Metadata } from 'next'
import SignInForm from './SignInForm'
import ClientOnly from '@/components/ClientOnly'
import { getSafePanelReturnTo } from '@/lib/panelRedirect'

export const metadata: Metadata = {
  title: 'Sign In — MXbeats',
  description: 'Sign in to your MXbeats account',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>
}) {
  const params = await searchParams
  const requestedReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo
  const returnTo = getSafePanelReturnTo(requestedReturnTo)

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
      <p className="text-sm text-gray-500 mb-8">
        Don&apos;t have an account?{' '}
        <a href="/sign-up" className="text-black underline hover:no-underline">
          Create one
        </a>
      </p>
      <ClientOnly>
        <SignInForm returnTo={returnTo} />
      </ClientOnly>
    </>
  )
}
