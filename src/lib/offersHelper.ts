import type { Payload } from 'payload'
import type { CommerceOffer, Product, ProductVariant } from '@/payload-types'
import { getUserLicenses } from '@/lib/licenseHelper'

type PopulatedLicense = {
  id: number
  product: Product
  productVariants: ProductVariant[]
  active?: boolean | null
}

export type AvailableOfferView = {
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

function isCommercialVariant(variant: ProductVariant): boolean {
  if (typeof variant.isCommercial === 'boolean') return variant.isCommercial
  return Boolean(variant.lemonSqueezyVariantId)
}

function isCommercialLicense(license: PopulatedLicense): boolean {
  return license.productVariants.some((variant) => isCommercialVariant(variant))
}

export async function getAvailableOffersForUser(
  payload: Payload,
  userId: number,
): Promise<AvailableOfferView[]> {
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

  const activeLicenses = licenses.filter((license) => license.active)
  const activeVariantById = new Map<number, ProductVariant>()

  for (const license of activeLicenses) {
    for (const variant of license.productVariants) {
      activeVariantById.set(variant.id, variant)
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
          ],
        },
      ],
    },
    limit: 200,
    depth: 2,
    overrideAccess: true,
  })

  return offersResult.docs.reduce<AvailableOfferView[]>((acc, offer) => {
    const actionType = offer.actionType
    if (actionType !== 'upgrade_replace' && actionType !== 'crossgrade') return acc

    const targetVariant =
      typeof offer.targetVariant === 'object' && offer.targetVariant ? offer.targetVariant : null
    if (!targetVariant) return acc
    if (activeVariantById.has(targetVariant.id)) return acc

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

      if (allowedFromProductIds.size === 0) return acc

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

    if (matchedFromVariants.length === 0) return acc

    acc.push({
      id: offer.id,
      name: offer.name,
      actionType,
      fromVariantNames: matchedFromVariants.map((variant) => variant.name),
      toVariantName: targetVariant.name,
      targetVariantId: targetVariant.id,
      hasLemonVariantMapping: Boolean(targetVariant.lemonSqueezyVariantId),
      referencePriceCents: offer.referencePriceCents ?? undefined,
    })

    return acc
  }, [])
}
