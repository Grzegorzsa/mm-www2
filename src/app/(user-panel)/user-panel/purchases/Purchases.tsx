import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionUser } from '@/lib/session'
import { getUserLicenses } from '@/lib/licenseHelper'
import { LicenseCard } from '@/components/panel/LicenseCard'
import { UpgradeButton } from '@/components/panel/UpgradeButton'
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
  actionType: 'upgrade_replace' | 'crossgrade'
  fromVariantNames: string[]
  toVariantName: string
  targetVariantId: number
  hasLemonVariantMapping: boolean
  referencePriceCents: number | undefined
}

function getVariantId(value: ProductVariant | number | null | undefined): number | null {
  if (!value) return null
  if (typeof value === 'number') return value
  return value.id
}

function formatPrice(cents?: number): string | null {
  if (!cents || cents <= 0) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function isCommercialVariant(variant: ProductVariant): boolean {
  if (typeof variant.isCommercial === 'boolean') return variant.isCommercial
  return Boolean(variant.lemonSqueezyVariantId)
}

function isCommercialLicense(license: PopulatedLicense): boolean {
  // Prefer explicit variant flag, fallback to Lemon mapping for backward compatibility.
  return license.productVariants.some((variant) => isCommercialVariant(variant))
}

export async function Purchases() {
  const user = await getSessionUser()
  const payload = await getPayload({ config })
  const showEligibilityDebug = process.env.NODE_ENV !== 'production'
  const eligibilityDebug: string[] = []

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
            {
              or: [
                { actionType: { equals: 'upgrade_replace' } },
                { actionType: { equals: 'crossgrade' } },
              ],
            },
          ],
        },
        limit: 200,
        depth: 2,
        overrideAccess: true,
      })
    : { docs: [] as CommerceOffer[] }

  const upgrades = offersResult.docs.reduce<UpgradeOfferView[]>((acc, offer) => {
    const actionType = offer.actionType
    if (actionType !== 'upgrade_replace' && actionType !== 'crossgrade') return acc

    const targetVariant =
      typeof offer.targetVariant === 'object' && offer.targetVariant ? offer.targetVariant : null

    if (!targetVariant) return acc

    if (activeVariantById.has(targetVariant.id)) {
      if (showEligibilityDebug) {
        eligibilityDebug.push(
          `Offer ${offer.id} (${offer.name}) skipped: user already owns target variant ${targetVariant.id}.`,
        )
      }
      return acc
    }

    let matchedFromVariants: ProductVariant[] = []

    if (actionType === 'crossgrade') {
      const allowedFromProductIds = new Set(
        (offer.allowedFromProducts ?? [])
          .map((product) => {
            if (typeof product === 'number') return product
            if (typeof product === 'object' && product && 'id' in product) {
              return (product as { id?: number }).id ?? null
            }
            return null
          })
          .filter((id): id is number => typeof id === 'number'),
      )

      if (allowedFromProductIds.size === 0) {
        if (showEligibilityDebug) {
          eligibilityDebug.push(
            `Offer ${offer.id} (${offer.name}) skipped: crossgrade has empty allowedFromProducts.`,
          )
        }
        return acc
      }

      const allowedFromVariantIds = new Set(
        (offer.allowedFromVariants ?? [])
          .map((variant) => getVariantId(variant as ProductVariant | number | null | undefined))
          .filter((id): id is number => id !== null),
      )
      const denyFromVariantIds = new Set(
        (offer.denyFromVariants ?? [])
          .map((variant) => getVariantId(variant as ProductVariant | number | null | undefined))
          .filter((id): id is number => id !== null),
      )

      const offerIsCommercial = offer.isCommercial ?? true

      matchedFromVariants = activeLicenses
        .filter((license) => {
          return (
            allowedFromProductIds.has(license.product.id) &&
            isCommercialLicense(license) === offerIsCommercial
          )
        })
        .flatMap((license) => {
          const licenseVariants = license.productVariants
          const candidateVariants =
            allowedFromVariantIds.size > 0
              ? licenseVariants.filter((variant) => allowedFromVariantIds.has(variant.id))
              : licenseVariants

          return candidateVariants.filter((variant) => !denyFromVariantIds.has(variant.id))
        })
    } else {
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

      matchedFromVariants = candidateFromVariants.filter((variant) => {
        return activeVariantById.has(variant.id) && !denyFromVariantIds.has(variant.id)
      })
    }

    if (matchedFromVariants.length === 0) {
      if (showEligibilityDebug) {
        eligibilityDebug.push(
          `Offer ${offer.id} (${offer.name}) skipped: no matching source variants after allowed/deny/commercial filters.`,
        )
      }
      return acc
    }

    if (showEligibilityDebug) {
      eligibilityDebug.push(
        `Offer ${offer.id} (${offer.name}) eligible with source variants: ${matchedFromVariants
          .map((v) => `${v.id}:${v.name}`)
          .join(', ')}.`,
      )
    }

    acc.push({
      id: offer.id,
      name: offer.name,
      actionType,
      fromVariantNames: matchedFromVariants.map((v) => v.name),
      toVariantName: targetVariant.name,
      targetVariantId: targetVariant.id,
      hasLemonVariantMapping: Boolean(targetVariant.lemonSqueezyVariantId),
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
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Available Offers</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upgrade or crossgrade from your current commercial license
        </p>

        {upgrades.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              No upgrade or crossgrade offers are currently available for your account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {upgrades.map((upgrade) => {
              const priceLabel = formatPrice(upgrade.referencePriceCents)
              const actionLabel = upgrade.actionType === 'crossgrade' ? 'Crossgrade' : 'Upgrade'

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

                  {upgrade.hasLemonVariantMapping ? (
                    <UpgradeButton variantId={upgrade.targetVariantId} label={actionLabel} />
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

        {showEligibilityDebug && eligibilityDebug.length > 0 ? (
          <details className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-xs font-medium text-gray-700">
              Dev debug: offer eligibility
            </summary>
            <ul className="mt-2 space-y-1 text-xs text-gray-500">
              {eligibilityDebug.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </div>
  )
}
