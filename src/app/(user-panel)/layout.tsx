import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { getSessionUser } from '@/lib/session'
import { getSafePanelReturnTo } from '@/lib/panelRedirect'
import config from '@payload-config'
import PanelShell from '@/components/panel/PanelShell'
import { LemonSqueezyScript } from '@/components/shared/LemonSqueezyScript'
import { getAvailableOffersForUser } from '@/lib/offersHelper'
import '../globals.css'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) {
    const returnTo = getSafePanelReturnTo((await headers()).get('x-user-panel-return-to'))
    redirect(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`)
  }

  const payload = await getPayload({ config })
  const offers = await getAvailableOffersForUser(payload, user.id)

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-gray-50 antialiased">
        <PanelShell userEmail={user.email} offersCount={offers.length}>
          {children}
        </PanelShell>
        <LemonSqueezyScript />
      </body>
    </html>
  )
}
