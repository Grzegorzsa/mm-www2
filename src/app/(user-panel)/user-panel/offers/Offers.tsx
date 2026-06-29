import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { UpgradeButton } from '@/components/panel/UpgradeButton'
import { getAvailableOffersForUserWithDebug } from '@/lib/offersHelper'
import { OffersDebug } from './OffersDebug'

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

  const { offers, debug } = user
    ? await getAvailableOffersForUserWithDebug(payload, user.id)
    : { offers: [], debug: [] }

  const isDev = process.env.NODE_ENV !== 'production'

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
            const isTrial = offer.actionType === 'trial'
            const actionLabel = isTrial
              ? 'Start Free Trial'
              : offer.actionType === 'crossgrade'
                ? 'Crossgrade'
                : 'Upgrade'

            return (
              <div key={offer.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{offer.toVariantName}</h3>
                  {isTrial && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                      Trial
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Offer: {offer.name}</p>
                <p className="mt-2 text-sm text-gray-600">
                  From: {offer.fromVariantNames.join(', ')}
                </p>
                {isTrial && offer.validDays ? (
                  <p className="mt-1 text-sm text-gray-600">
                    Duration: {offer.validDays} day{offer.validDays !== 1 ? 's' : ''}
                  </p>
                ) : priceLabel ? (
                  <p className="mt-1 text-sm text-gray-700">Reference price: {priceLabel}</p>
                ) : null}

                {isTrial ? (
                  <UpgradeButton
                    variantId={offer.targetVariantId}
                    label={actionLabel}
                    isTrial
                    offerActionType="trial"
                  />
                ) : offer.hasLemonVariantMapping ? (
                  <UpgradeButton
                    variantId={offer.targetVariantId}
                    label={actionLabel}
                    offerActionType={offer.actionType}
                  />
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

      {isDev && debug.length > 0 && <OffersDebug entries={debug} />}
    </div>
  )
}
