import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import PanelShell from '@/components/panel/PanelShell'
import '../globals.css'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/sign-in')

  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        <PanelShell userEmail={user.email}>{children}</PanelShell>
      </body>
    </html>
  )
}
