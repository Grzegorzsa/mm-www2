import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ActivationCodesGeneratorForm } from './ActivationCodesGeneratorForm'

type ProductOption = {
  id: number
  name: string
  versionNo?: number | null
}

type VariantOption = {
  id: number
  name: string
  product: number | { id?: number } | null
}

type AffiliateOption = {
  id: number
  name: string
  affiliateCode?: string | null
  active?: boolean | null
}

function resolveProductId(value: VariantOption['product']): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object' && typeof value.id === 'number') return value.id
  return null
}

export default async function ActivationCodesToolPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || (user as { collection?: string }).collection !== 'admin-users') {
    redirect('/admin/login')
  }

  const [productsResult, variantsResult, affiliatesResult] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 0,
      limit: 1000,
      sort: 'name',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'product-variants',
      depth: 0,
      limit: 2000,
      sort: 'name',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'affiliates',
      depth: 0,
      limit: 2000,
      sort: 'name',
      overrideAccess: true,
    }),
  ])

  const products = (productsResult.docs as ProductOption[]).map((product) => ({
    id: product.id,
    name: product.name,
    versionNo: typeof product.versionNo === 'number' ? product.versionNo : null,
  }))

  const variants = (variantsResult.docs as VariantOption[])
    .map((variant) => ({
      id: variant.id,
      name: variant.name,
      productId: resolveProductId(variant.product),
    }))
    .filter((variant): variant is { id: number; name: string; productId: number } =>
      Number.isFinite(variant.productId),
    )

  const affiliates = (affiliatesResult.docs as AffiliateOption[]).map((affiliate) => ({
    id: affiliate.id,
    name: affiliate.name,
    affiliateCode: affiliate.affiliateCode ?? '',
    active: Boolean(affiliate.active ?? true),
  }))

  return (
    <ActivationCodesGeneratorForm products={products} variants={variants} affiliates={affiliates} />
  )
}
