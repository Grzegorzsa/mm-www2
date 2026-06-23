import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getUserLicenses } from '@/lib/licenseHelper'
import { LicenseCard } from '@/components/panel/LicenseCard'
import type { CommerceOffer, License, Product, ProductVariant } from '@/payload-types'

type PopulatedLicense = Pick<
  License,
  'id' | 'validTill' | 'versionFrom' | 'versionTo' | 'active' | 'createdAt' | 'info'
> & {
  product: Product
  productVariants: ProductVariant[]
}

type UpgradeOfferView = {
  id: number
  name: string
  fromVariantNames: string[]
  toVariantName: string
  checkoutUrl: string
  referencePriceCents: number | undefined
}

function getVariantId(value: ProductVariant | number | null | undefined): number | null {
  if (!value) return null
  if (typeof value === 'number') return value
  return value.id
}

function toCheckoutUrl(baseUrl: string, lemonVariantId: string): string {
  if (!baseUrl || !lemonVariantId) return ''

  try {
    const url = new URL(baseUrl)
    url.searchParams.set('variant', lemonVariantId)
    return url.toString()
  } catch {
    return ''
  }
}

function formatPrice(cents?: number): string | null {
  if (!cents || cents <= 0) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export async function Purchases() {
  const user = await getSessionUser()
  const payload = await getPayload({ config })
  const lemonBaseCheckoutUrl = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_BASE_URL ?? ''

  const rawLicenses = user ? await getUserLicenses(payload, user.id) : []

  // Filter to populated licenses only (product must be an object, not just an id)
  const licenses = rawLicenses
    .filter((l) => l.product && typeof l.product === 'object')
    .map((l) => ({
      ...l,
      product: l.product as Product,
      productVariants: ((l.productVariants ?? []) as Array<ProductVariant | number>).filter(
        (v): v is ProductVariant => typeof v === 'object' && v !== null,
      ),
    })) as PopulatedLicense[]

  const activeLicenses = licenses.filter((license) => license.active)
  const activeVariantById = new Map<number, ProductVariant>()

  for (const license of activeLicenses) {
    for (const variant of license.productVariants) {
      activeVariantById.set(variant.id, variant)
    }
  }

  const offersResult = user
    ? await payload.find({
        collection: 'commerce-offers',
        where: {
          and: [
            { active: { equals: true } },
            { actionType: { equals: 'upgrade_replace' } },
          ],
        },
        limit: 200,
        depth: 2,
        overrideAccess: true,
      })
    : { docs: [] as CommerceOffer[] }

  const upgrades = offersResult.docs.reduce<UpgradeOfferView[]>((acc, offer) => {
      const targetVariant =
        typeof offer.targetVariant === 'object' && offer.targetVariant ? offer.targetVariant : null

      if (!targetVariant) return acc

      if (activeVariantById.has(targetVariant.id)) return acc

      const allowedFromVariants = (offer.allowedFromVariants ?? []).filter(
        (v): v is ProductVariant => typeof v === 'object' && v !== null,
      )
      const denyFromVariantIds = new Set(
        (offer.denyFromVariants ?? [])
          .map((v) => getVariantId(v as ProductVariant | number | null | undefined))
          .filter((id): id is number => id !== null),
      )

      const candidateFromVariants =
        allowedFromVariants.length > 0
          ? allowedFromVariants
          : Array.from(activeVariantById.values()).filter((variant) => {
              return variant.id !== targetVariant.id
            })

      const matchedFromVariants = candidateFromVariants.filter((variant) => {
        return activeVariantById.has(variant.id) && !denyFromVariantIds.has(variant.id)
      })

      if (matchedFromVariants.length === 0) return acc

      const checkoutUrl = toCheckoutUrl(
        lemonBaseCheckoutUrl,
        String(targetVariant.lemonSqueezyVariantId ?? ''),
      )

      acc.push({
        id: offer.id,
        name: offer.name,
        fromVariantNames: matchedFromVariants.map((v) => v.name),
        toVariantName: targetVariant.name,
        checkoutUrl,
        referencePriceCents: offer.referencePriceCents ?? undefined,
      })

      return acc
    }, [])

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Purchases</h1>
      <p className="text-sm text-gray-500 mb-8">Your license history</p>

      {licenses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-400 text-sm">No purchases yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-fit">
          {licenses.map((license) => (
            <LicenseCard key={license.id} license={license} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Available Upgrades</h2>
        <p className="text-sm text-gray-500 mb-4">Upgrade from your current commercial license</p>

        {upgrades.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">No upgrade offers are currently available for your account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {upgrades.map((upgrade) => {
              const priceLabel = formatPrice(upgrade.referencePriceCents)

              return (
                <div key={upgrade.id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-gray-900">{upgrade.toVariantName}</h3>
                  <p className="mt-1 text-xs text-gray-500">Offer: {upgrade.name}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    From: {upgrade.fromVariantNames.join(', ')}
                  </p>
                  {priceLabel ? (
                    <p className="mt-1 text-sm text-gray-700">Reference price: {priceLabel}</p>
                  ) : null}

                  {upgrade.checkoutUrl ? (
                    <a
                      href={upgrade.checkoutUrl}
                      className="inline-block mt-4 bg-black text-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium rounded-lg"
                    >
                      Upgrade
                    </a>
                  ) : (
                    <p className="mt-4 text-xs text-amber-700">
                      Checkout URL is not configured for this variant yet.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
