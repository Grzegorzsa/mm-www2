'use client'

import { useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'

type GenerateResponse = {
  success: boolean
  batchId: string
  created: number
  codes: string[]
}

type ProductOption = {
  id: number
  name: string
  versionNo?: number | null
}

type VariantOption = {
  id: number
  name: string
  productId: number
}

type AffiliateOption = {
  id: number
  name: string
  affiliateCode?: string
  active: boolean
}

type Props = {
  products: ProductOption[]
  variants: VariantOption[]
  affiliates: AffiliateOption[]
}

type FormState = {
  quantity: string
  productId: string
  productVariantId: string
  versionFrom: string
  versionTo: string
  maxInstallations: string
  validDays: string
  expiresAt: string
  sellerId: string
  info: string
  trial: boolean
  assignSellerAsLifetime: boolean
}

const initialState: FormState = {
  quantity: '100',
  productId: '',
  productVariantId: '',
  versionFrom: '1',
  versionTo: '1',
  maxInstallations: '2',
  validDays: '',
  expiresAt: '',
  sellerId: '',
  info: '',
  trial: false,
  assignSellerAsLifetime: false,
}

function fieldStyle(): CSSProperties {
  return {
    width: '100%',
    border: '1px solid var(--theme-elevation-250)',
    borderRadius: 6,
    padding: '8px 10px',
    fontSize: 14,
    background: 'var(--theme-bg)',
    color: 'var(--theme-text)',
  }
}

export function ActivationCodesGeneratorForm({ products, variants, affiliates }: Props) {
  const [form, setForm] = useState<FormState>(initialState)
  const [onlyActiveAffiliates, setOnlyActiveAffiliates] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [copied, setCopied] = useState(false)

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const filteredVariants = useMemo(() => {
    const selectedProductId = Number(form.productId)
    if (!Number.isFinite(selectedProductId)) return []
    return variants.filter((variant) => variant.productId === selectedProductId)
  }, [form.productId, variants])

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === form.productId) ?? null,
    [form.productId, products],
  )

  const availableAffiliates = useMemo(
    () => affiliates.filter((affiliate) => (onlyActiveAffiliates ? affiliate.active : true)),
    [affiliates, onlyActiveAffiliates],
  )

  function handleOnlyActiveAffiliatesChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.checked
    setOnlyActiveAffiliates(nextValue)

    if (nextValue) {
      const selectedAffiliate = affiliates.find(
        (affiliate) => String(affiliate.id) === form.sellerId,
      )
      if (selectedAffiliate && !selectedAffiliate.active) {
        updateField('sellerId', '')
      }
    }
  }

  function handleProductChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextProductId = event.target.value
    const nextProduct = products.find((product) => String(product.id) === nextProductId) ?? null

    const hasCurrentVariantForProduct = variants.some(
      (variant) =>
        String(variant.id) === form.productVariantId && String(variant.productId) === nextProductId,
    )

    setForm((prev) => ({
      ...prev,
      productId: nextProductId,
      productVariantId: hasCurrentVariantForProduct ? prev.productVariantId : '',
      ...(nextProduct && typeof nextProduct.versionNo === 'number'
        ? {
            versionFrom: String(nextProduct.versionNo),
            versionTo: String(nextProduct.versionNo),
          }
        : {}),
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setResult(null)
    setCopied(false)

    try {
      const payload = {
        quantity: Number(form.quantity),
        productId: Number(form.productId),
        productVariantId: Number(form.productVariantId),
        versionFrom: Number(form.versionFrom),
        versionTo: Number(form.versionTo),
        maxInstallations: Number(form.maxInstallations || '2'),
        validDays: form.validDays.trim() ? Number(form.validDays) : null,
        expiresAt: form.expiresAt.trim() || null,
        sellerId: form.sellerId.trim() ? Number(form.sellerId) : null,
        trial: form.trial,
        assignSellerAsLifetime: form.assignSellerAsLifetime,
        info: form.info.trim() || null,
      }

      const response = await fetch('/api/admin/activation-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as GenerateResponse | { error?: string }
      if (!response.ok) {
        throw new Error((data as { error?: string }).error ?? 'Generation failed')
      }

      setResult(data as GenerateResponse)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function copyCodes() {
    if (!result?.codes?.length) return
    await navigator.clipboard.writeText(result.codes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const batchId = result?.batchId ?? ''
  const csvUrl = batchId
    ? `/api/admin/activation-codes/export?batchId=${encodeURIComponent(batchId)}`
    : null

  return (
    <div style={{ padding: 24, maxWidth: 980 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Activation Codes Tool</h1>
      <p style={{ marginTop: 8, color: 'var(--theme-elevation-700)' }}>
        Generate activation code batches and export them to CSV by batch ID.
      </p>
      {selectedProduct && typeof selectedProduct.versionNo === 'number' ? (
        <p style={{ marginTop: 4, color: 'var(--theme-elevation-700)' }}>
          Selected product major version: {selectedProduct.versionNo}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          <label>
            Quantity
            <input
              style={fieldStyle()}
              type="number"
              min={1}
              max={1000}
              value={form.quantity}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('quantity', e.target.value)
              }
              required
            />
          </label>

          <label>
            Product
            <select
              style={fieldStyle()}
              value={form.productId}
              onChange={handleProductChange}
              required
            >
              <option value="">Select product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Variant
            <select
              style={fieldStyle()}
              value={form.productVariantId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                updateField('productVariantId', e.target.value)
              }
              required
              disabled={!form.productId}
            >
              <option value="">Select variant...</option>
              {filteredVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Version From
            <input
              style={fieldStyle()}
              type="number"
              min={1}
              value={form.versionFrom}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('versionFrom', e.target.value)
              }
              required
            />
          </label>

          <label>
            Version To
            <input
              style={fieldStyle()}
              type="number"
              min={1}
              value={form.versionTo}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('versionTo', e.target.value)
              }
              required
            />
          </label>

          <label>
            Max Installations
            <input
              style={fieldStyle()}
              type="number"
              min={1}
              value={form.maxInstallations}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('maxInstallations', e.target.value)
              }
              required
            />
          </label>

          <label>
            Valid Days (optional)
            <input
              style={fieldStyle()}
              type="number"
              min={1}
              value={form.validDays}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('validDays', e.target.value)
              }
              placeholder="e.g. 14"
            />
          </label>

          <label>
            Code Expires At (optional)
            <input
              style={fieldStyle()}
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('expiresAt', e.target.value)
              }
            />
          </label>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={onlyActiveAffiliates}
                onChange={handleOnlyActiveAffiliatesChange}
              />
              Only active affiliates
            </label>
            <label>
              Seller (optional)
              <select
                style={fieldStyle()}
                value={form.sellerId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  updateField('sellerId', e.target.value)
                }
              >
                <option value="">No seller</option>
                {availableAffiliates.map((affiliate) => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.name}
                    {affiliate.affiliateCode ? ` (${affiliate.affiliateCode})` : ''}
                    {affiliate.active ? '' : ' [inactive]'}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label style={{ display: 'block', marginTop: 12 }}>
          Internal info (optional)
          <textarea
            style={{ ...fieldStyle(), minHeight: 80 }}
            value={form.info}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('info', e.target.value)}
          />
        </label>

        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.trial}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('trial', e.target.checked)
              }
            />
            Trial
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.assignSellerAsLifetime}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('assignSellerAsLifetime', e.target.checked)
              }
            />
            Assign seller as lifetime (public redeem only)
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: 16,
            background: 'var(--theme-text)',
            color: 'var(--theme-bg)',
            border: 'none',
            borderRadius: 6,
            padding: '10px 14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Codes'}
        </button>
      </form>

      {error ? (
        <div
          style={{
            marginTop: 16,
            border: '1px solid #f59e9e',
            background: '#fff1f2',
            color: '#991b1b',
            borderRadius: 6,
            padding: 10,
          }}
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              border: '1px solid var(--theme-elevation-250)',
              borderRadius: 8,
              padding: 14,
              background: 'var(--theme-elevation-0)',
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Batch ID:</strong> {result.batchId}
            </p>
            <p style={{ margin: '6px 0 0 0' }}>
              <strong>Created:</strong> {result.created}
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={copyCodes}
                style={{
                  border: '1px solid var(--theme-elevation-250)',
                  borderRadius: 6,
                  padding: '8px 10px',
                  background: 'var(--theme-bg)',
                  color: 'var(--theme-text)',
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied' : 'Copy codes'}
              </button>

              {csvUrl ? (
                <a
                  href={csvUrl}
                  style={{
                    border: '1px solid var(--theme-elevation-250)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    color: 'var(--theme-text)',
                    textDecoration: 'none',
                  }}
                >
                  Export CSV
                </a>
              ) : null}
            </div>
          </div>

          <textarea
            readOnly
            value={result.codes.join('\n')}
            style={{ ...fieldStyle(), marginTop: 12, minHeight: 220, fontFamily: 'monospace' }}
          />
        </div>
      ) : null}
    </div>
  )
}
