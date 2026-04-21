import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getInstallationsByUserId } from '@/lib/installationsHelper'
import { InstallationCard } from '@/components/panel/InstallationCard'
import type { Product, Installation } from '@/payload-types'

type PopulatedInstallation = Omit<Installation, 'product'> & { product: Product }

export async function Installations() {
  const user = await getSessionUser()
  const payload = await getPayload({ config })

  const rawInstallations = user ? await getInstallationsByUserId(payload, user.id) : []

  const installations = rawInstallations.filter(
    (i) => i.product && typeof i.product === 'object',
  ) as PopulatedInstallation[]

  // Check if user has 2+ installations of the same product
  const productCounts = installations.reduce(
    (acc, inst) => {
      const productId = inst.product.id
      acc[productId] = (acc[productId] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  const hasMultipleInstallationsSameApp = Object.values(productCounts).some((count) => count >= 2)

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Installations</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your active installations &mdash; up to 2 per account.
      </p>

      {hasMultipleInstallationsSameApp && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-8 max-w-6xl">
          <p className="text-sm text-blue-900">
            Each software can be installed on a maximum of <strong>two devices</strong>. To install
            it on a new device, please <strong>deactivate it on one of your current devices</strong>{' '}
            through the app itself.
          </p>
        </div>
      )}

      {installations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-400 text-sm">No active installations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-fit">
          {installations.map((installation) => (
            <InstallationCard key={installation.id} installation={installation} />
          ))}
        </div>
      )}
    </div>
  )
}
