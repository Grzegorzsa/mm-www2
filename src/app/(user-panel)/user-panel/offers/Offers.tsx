import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { UpgradeButton } from '@/components/panel/UpgradeButton'
import { getAvailableOffersForUser } from '@/lib/offersHelper'

function formatPrice(cents?: number): string | null {
  if (!cents || cents <= 0) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export async function Offers() {
  const user = await getSessionUser()
  const payload = await getPayload({ config })

  const offers = user ? await getAvailableOffersForUser(payload, user.id) : []

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Offers</h1>
      <p className="text-sm text-gray-500 mb-6">Upgrade and crossgrade offers available for you</p>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            No offers are currently available for your account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {offers.map((offer) => {
            const priceLabel = formatPrice(offer.referencePriceCents)
            const actionLabel = offer.actionType === 'crossgrade' ? 'Crossgrade' : 'Upgrade'

            return (
              <div key={offer.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">{offer.toVariantName}</h3>
                <p className="mt-1 text-xs text-gray-500">Offer: {offer.name}</p>
                <p className="mt-2 text-sm text-gray-600">
                  From: {offer.fromVariantNames.join(', ')}
                </p>
                {priceLabel ? (
                  <p className="mt-1 text-sm text-gray-700">Reference price: {priceLabel}</p>
                ) : null}

                {offer.hasLemonVariantMapping ? (
                  <UpgradeButton variantId={offer.targetVariantId} label={actionLabel} />
                ) : (
                  <p className="mt-4 text-xs text-amber-700">
                    Lemon variant mapping is not configured for this target variant yet.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
