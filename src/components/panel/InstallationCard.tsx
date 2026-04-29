import type { Installation, Product } from '@/payload-types'
import Image from 'next/image'

type PopulatedInstallation = Pick<
  Installation,
  'id' | 'machineId' | 'computerName' | 'os' | 'disabled' | 'createdAt'
> & {
  product: Product
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function InstallationCard({ installation }: { installation: PopulatedInstallation }) {
  const { product, machineId, computerName, os, disabled, createdAt } = installation

  const thumb = product.thumb && typeof product.thumb === 'object' ? product.thumb : null
  const active = !disabled

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-sm w-full min-w-xsm max-w-sm">
      {thumb?.url && (
        <div className="relative w-full aspect-864/350 bg-gray-100">
          <Image
            src={thumb.url}
            alt={thumb.alt ?? product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="eager"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-5 mb-3">
          <h2 className="text-base font-semibold text-gray-900">{product.name}</h2>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
              active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}
          >
            {active ? 'Active' : 'Disabled'}
          </span>
        </div>

        <dl className="text-sm space-y-1 text-gray-600">
          <div className="flex gap-1">
            <dt className="text-gray-400">Machine ID:</dt>
            <dd className="font-mono text-xs leading-5">{machineId}</dd>
          </div>
          {computerName && (
            <div className="flex gap-1">
              <dt className="text-gray-400">Computer:</dt>
              <dd>{computerName}</dd>
            </div>
          )}
          {os && (
            <div className="flex gap-1">
              <dt className="text-gray-400">OS:</dt>
              <dd>{os}</dd>
            </div>
          )}
          <div className="flex gap-1">
            <dt className="text-gray-400">Registered:</dt>
            <dd>{formatDate(createdAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
