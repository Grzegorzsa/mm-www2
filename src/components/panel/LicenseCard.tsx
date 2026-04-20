import type { License, Product, ProductExtension } from '@/payload-types'
import Image from 'next/image'

type PopulatedLicense = Pick<
  License,
  'id' | 'validTill' | 'versionFrom' | 'versionTo' | 'active' | 'createdAt' | 'info'
> & {
  product: Product
  productExtensions: ProductExtension[]
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Perpetual'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function LicenseCard({ license }: { license: PopulatedLicense }) {
  const { product, productExtensions, validTill, versionFrom, versionTo, active, createdAt, info } =
    license

  const thumb = product.thumb && typeof product.thumb === 'object' ? product.thumb : null

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-sm w-full max-w-sm">
      {thumb?.url && (
        <div className="relative w-full aspect-864/350 bg-gray-100">
          <Image
            src={thumb.url}
            alt={thumb.alt ?? product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-5 mb-3">
          <h2 className="text-base font-semibold text-gray-900">{product.name}</h2>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}
          >
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <dl className="text-sm space-y-1 text-gray-600">
          <div className="flex gap-1">
            <dt className="text-gray-400">Start Date:</dt>
            <dd>{formatDate(createdAt)}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-gray-400">Valid Until:</dt>
            <dd>{formatDate(validTill)}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-gray-400">App Version:</dt>
            <dd>{product.versionNo}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-gray-400">Versions:</dt>
            <dd>
              {versionFrom} – {versionTo >= 999 ? '∞' : versionTo}
            </dd>
          </div>
          {productExtensions && productExtensions.length > 0 && (
            <div className="flex gap-1">
              <dt className="text-gray-400">Extensions:</dt>
              <dd>{productExtensions.map((e) => e.name).join(', ')}</dd>
            </div>
          )}
        </dl>

        {info && <p className="mt-3 text-xs text-gray-400 italic">{info}</p>}
      </div>
    </div>
  )
}
