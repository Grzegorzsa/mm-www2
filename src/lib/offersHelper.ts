import type { Payload } from 'payload'
import type { Product, ProductVariant } from '@/payload-types'
import { getUserLicenses } from '@/lib/licenseHelper'
import { getVariantHierarchy } from '@/lib/variantOwnership'

type PopulatedLicense = {
  id: number
  product: Product
  productVariants: ProductVariant[]
  active?: boolean | null
  validTill?: string | null
  trial?: boolean | null
}

export type AvailableOfferView = {
  id: number
  name: string
  actionType: 'upgrade_replace' | 'crossgrade' | 'trial'
  fromVariantNames: string[]
  toVariantName: string
  targetVariantId: number
  hasLemonVariantMapping: boolean
  referencePriceCents: number | undefined
  validDays?: number | null
}

export type OfferDebugEntry = {
  offerId: number
  offerName: string
  actionType: string
  targetVariantName: string
  accepted: boolean
  reason: string
}

type GetOffersResult = {
  offers: AvailableOfferView[]
  debug: OfferDebugEntry[]
}

function getVariantId(value: ProductVariant | number | null | undefined): number | null {
  if (!value) return null
  if (typeof value === 'number') return value
  return value.id
}

function isCommercialVariant(variant: ProductVariant): boolean {
  if (typeof variant.isCommercial === 'boolean') return variant.isCommercial
  return Boolean(variant.lemonSqueezyVariantId)
}

function isCommercialLicense(license: PopulatedLicense): boolean {
  return license.productVariants.some((variant) => isCommercialVariant(variant))
}

function isOfferEligibleLicense(license: PopulatedLicense): boolean {
  return Boolean(license.active) && !license.validTill
}

async function getAvailableOffersForUserInternal(
  payload: Payload,
  userId: number,
): Promise<GetOffersResult> {
  const rawLicenses = await getUserLicenses(payload, userId)

  const licenses = rawLicenses
    .filter((license) => license.product && typeof license.product === 'object')
    .map((license) => ({
      ...license,
      product: license.product as Product,
      productVariants: ((license.productVariants ?? []) as Array<ProductVariant | number>).filter(
        (variant): variant is ProductVariant => typeof variant === 'object' && variant !== null,
      ),
    })) as PopulatedLicense[]

  const activeLicenses = licenses.filter(isOfferEligibleLicense)
  const activeVariantById = new Map<number, ProductVariant>()

  for (const license of activeLicenses) {
    for (const variant of license.productVariants) {
      activeVariantById.set(variant.id, variant)
    }
  }

  // Collect variant IDs from active trial licenses to block duplicate trials
  const activeTrialVariantIds = new Set<number>()
  for (const license of licenses) {
    if (license.trial && license.active) {
      for (const variant of license.productVariants) {
        activeTrialVariantIds.add(variant.id)
      }
    }
  }

  let maxOwnedHierarchy: number | null = null
  for (const ownedVariant of activeVariantById.values()) {
    const hierarchy = getVariantHierarchy(ownedVariant)
    if (!hierarchy) continue
    if (maxOwnedHierarchy === null || hierarchy > maxOwnedHierarchy) {
      maxOwnedHierarchy = hierarchy
    }
  }

  const offersResult = await payload.find({
    collection: 'commerce-offers',
    where: {
      and: [
        { active: { equals: true } },
        {
          or: [
            { actionType: { equals: 'upgrade_replace' } },
            { actionType: { equals: 'crossgrade' } },
            { actionType: { equals: 'trial' } },
          ],
        },
      ],
    },
    limit: 200,
    depth: 2,
    overrideAccess: true,
  })

  const debugEntries: OfferDebugEntry[] = []

  const offers = offersResult.docs.reduce<AvailableOfferView[]>((acc, offer) => {
    const actionType = offer.actionType
    const targetVariant =
      typeof offer.targetVariant === 'object' && offer.targetVariant ? offer.targetVariant : null
    const targetVariantName = targetVariant?.name ?? `variant#${String(offer.targetVariant)}`

    function reject(reason: string): AvailableOfferView[] {
      debugEntries.push({
        offerId: offer.id,
        offerName: offer.name,
        actionType,
        targetVariantName,
        accepted: false,
        reason,
      })
      return acc
    }

    if (actionType !== 'upgrade_replace' && actionType !== 'crossgrade' && actionType !== 'trial') {
      return reject(`actionType '${actionType}' is not handled`)
    }

    if (!targetVariant) {
      return reject('targetVariant is not populated')
    }

    if (activeVariantById.has(targetVariant.id)) {
      return reject(`user already owns target variant '${targetVariantName}'`)
    }

    const targetHierarchy = getVariantHierarchy(targetVariant)
    if (
      maxOwnedHierarchy !== null &&
      targetHierarchy !== null &&
      targetHierarchy <= maxOwnedHierarchy
    ) {
      return reject(
        `target hierarchy ${String(targetHierarchy)} ≤ max owned hierarchy ${String(maxOwnedHierarchy)}`,
      )
    }

    // For trial: block if user already has an active trial for this variant
    if (actionType === 'trial' && activeTrialVariantIds.has(targetVariant.id)) {
      return reject(`user already has an active trial for variant '${targetVariantName}'`)
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
        return reject('crossgrade has no allowedFromProducts configured')
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
          const candidateVariants =
            allowedFromVariantIds.size > 0
              ? license.productVariants.filter((variant) => allowedFromVariantIds.has(variant.id))
              : license.productVariants

          return candidateVariants.filter((variant) => !denyFromVariantIds.has(variant.id))
        })
    } else {
      // upgrade_replace and trial: match source variants from user's active licenses
      const allowedFromVariants = (offer.allowedFromVariants ?? []).filter(
        (variant): variant is ProductVariant => typeof variant === 'object' && variant !== null,
      )
      const denyFromVariantIds = new Set(
        (offer.denyFromVariants ?? [])
          .map((variant) => getVariantId(variant as ProductVariant | number | null | undefined))
          .filter((id): id is number => id !== null),
      )

      const candidateFromVariants =
        allowedFromVariants.length > 0
          ? allowedFromVariants
          : Array.from(activeVariantById.values()).filter(
              (variant) => variant.id !== targetVariant.id,
            )

      matchedFromVariants = candidateFromVariants.filter(
        (variant) => activeVariantById.has(variant.id) && !denyFromVariantIds.has(variant.id),
      )
    }

    if (matchedFromVariants.length === 0) {
      return reject('no matching source license/variant found')
    }

    debugEntries.push({
      offerId: offer.id,
      offerName: offer.name,
      actionType,
      targetVariantName,
      accepted: true,
      reason: `matched from: ${matchedFromVariants.map((v) => v.name).join(', ')}`,
    })

    acc.push({
      id: offer.id,
      name: offer.name,
      actionType: actionType as 'upgrade_replace' | 'crossgrade' | 'trial',
      fromVariantNames: matchedFromVariants.map((variant) => variant.name),
      toVariantName: targetVariant.name,
      targetVariantId: targetVariant.id,
      hasLemonVariantMapping: Boolean(targetVariant.lemonSqueezyVariantId),
      referencePriceCents: offer.referencePriceCents ?? undefined,
      validDays: offer.validDays ?? null,
    })

    return acc
  }, [])

  return { offers, debug: debugEntries }
}

export async function getAvailableOffersForUser(
  payload: Payload,
  userId: number,
): Promise<AvailableOfferView[]> {
  const { offers } = await getAvailableOffersForUserInternal(payload, userId)
  return offers
}

export async function getAvailableOffersForUserWithDebug(
  payload: Payload,
  userId: number,
): Promise<GetOffersResult> {
  return getAvailableOffersForUserInternal(payload, userId)
}
