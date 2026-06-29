import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ActivationCodesGeneratorForm } from './ActivationCodesGeneratorForm'

type DefinitionOption = {
  id: number
  name: string
  actionType?: 'new_purchase' | 'upgrade_replace' | null
  product?: { name?: string } | number | null
  productVariant?: { name?: string } | number | null
  allowedFromVariants?: Array<{ name?: string } | number> | null
  versionFrom?: number | null
  versionTo?: number | null
  trial?: boolean | null
  maxInstallations?: number | null
  validDays?: number | null
  seller?: { name?: string } | number | null
  assignSellerAsLifetime?: boolean | null
  info?: string | null
}

type FormDefinitionOption = {
  id: number
  name: string
  actionType: 'new_purchase' | 'upgrade_replace'
  productName: string
  variantName: string
  allowedFromVariantNames: string[]
  versionFrom: number
  versionTo: number
  trial: boolean
  maxInstallations: number
  validDays: number | null
  sellerName: string | null
  assignSellerAsLifetime: boolean
  info: string | null
}

export default async function ActivationCodesToolPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || (user as { collection?: string }).collection !== 'admin-users') {
    redirect('/admin/login')
  }

  const definitionsResult = await payload.find({
    collection: 'activation-code-definitions',
    depth: 2,
    limit: 2000,
    sort: 'name',
    overrideAccess: true,
  })

  const definitions = (definitionsResult.docs as DefinitionOption[]).map<FormDefinitionOption>(
    (definition) => ({
      id: definition.id,
      name: definition.name,
      actionType: definition.actionType === 'upgrade_replace' ? 'upgrade_replace' : 'new_purchase',
      productName:
        typeof definition.product === 'object' && definition.product?.name
          ? definition.product.name
          : 'Unknown product',
      variantName:
        typeof definition.productVariant === 'object' && definition.productVariant?.name
          ? definition.productVariant.name
          : 'Unknown variant',
      allowedFromVariantNames: Array.isArray(definition.allowedFromVariants)
        ? definition.allowedFromVariants
            .map((variant) =>
              typeof variant === 'object' && variant?.name
                ? variant.name
                : typeof variant === 'number'
                  ? String(variant)
                  : null,
            )
            .filter((name): name is string => Boolean(name))
        : [],
      versionFrom:
        typeof definition.versionFrom === 'number' && Number.isFinite(definition.versionFrom)
          ? definition.versionFrom
          : 1,
      versionTo:
        typeof definition.versionTo === 'number' && Number.isFinite(definition.versionTo)
          ? definition.versionTo
          : 1,
      trial: Boolean(definition.trial),
      maxInstallations:
        typeof definition.maxInstallations === 'number' &&
        Number.isFinite(definition.maxInstallations)
          ? definition.maxInstallations
          : 2,
      validDays:
        typeof definition.validDays === 'number' && Number.isFinite(definition.validDays)
          ? definition.validDays
          : null,
      sellerName:
        typeof definition.seller === 'object' && definition.seller?.name
          ? definition.seller.name
          : null,
      assignSellerAsLifetime: Boolean(definition.assignSellerAsLifetime),
      info:
        typeof definition.info === 'string' && definition.info.trim()
          ? definition.info.trim()
          : null,
    }),
  )

  return <ActivationCodesGeneratorForm definitions={definitions} />
}
