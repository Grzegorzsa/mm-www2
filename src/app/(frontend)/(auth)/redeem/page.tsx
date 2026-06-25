import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import ClientOnly from '@/components/ClientOnly'
import { getSessionUser } from '@/lib/session'
import { RedeemForm } from './RedeemForm'

export const metadata: Metadata = {
  title: 'Redeem Activation Code — MXbeats',
  description: 'Redeem your activation code and create an MXbeats account',
}

export default async function RedeemPage() {
  const user = await getSessionUser()

  if (user) {
    redirect('/user-panel/redeem')
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Redeem Activation Code</h1>
      <p className="text-sm text-gray-500 mb-8">
        Already have an account?{' '}
        <a href="/sign-in" className="text-black underline hover:no-underline">
          Sign in
        </a>{' '}
        and redeem from your user panel.
      </p>
      <ClientOnly>
        <RedeemForm />
      </ClientOnly>
    </>
  )
}
