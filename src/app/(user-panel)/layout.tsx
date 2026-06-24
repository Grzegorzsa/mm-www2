import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { getSessionUser } from '@/lib/session'
import config from '@payload-config'
import PanelShell from '@/components/panel/PanelShell'
import { LemonSqueezyScript } from '@/components/shared/LemonSqueezyScript'
import { getAvailableOffersForUser } from '@/lib/offersHelper'
import '../globals.css'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/sign-in')

  const payload = await getPayload({ config })
  const offers = await getAvailableOffersForUser(payload, user.id)

  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        <PanelShell userEmail={user.email} offersCount={offers.length}>
          {children}
        </PanelShell>
        <LemonSqueezyScript />
      </body>
    </html>
  )
}
