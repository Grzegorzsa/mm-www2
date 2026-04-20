import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getUserLicenses } from '@/lib/licenseHelper'
import { LicenseCard } from '@/components/panel/LicenseCard'
import type { Product, ProductExtension } from '@/payload-types'

export const metadata: Metadata = { title: 'Purchases — MXbeats' }

export default async function PurchasesPage() {
  const user = await getSessionUser()
  const payload = await getPayload({ config })

  const rawLicenses = user ? await getUserLicenses(payload, user.id) : []

  // Filter to populated licenses only (product must be an object, not just an id)
  const licenses = rawLicenses.filter((l) => l.product && typeof l.product === 'object') as Array<
    (typeof rawLicenses)[number] & {
      product: Product
      productExtensions: ProductExtension[]
    }
  >

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Purchases</h1>
      <p className="text-sm text-gray-500 mb-8">Your license history</p>

      {licenses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-400 text-sm">No purchases yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-center">
          {licenses.map((license) => (
            <LicenseCard key={license.id} license={license} />
          ))}
        </div>
      )}
    </div>
  )
}
