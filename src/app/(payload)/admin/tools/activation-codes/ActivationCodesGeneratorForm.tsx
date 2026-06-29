'use client'

import { useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'

type GenerateResponse = {
  success: boolean
  batchId: string
  created: number
  codes: string[]
}

type DefinitionOption = {
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

type Props = {
  definitions: DefinitionOption[]
}

type FormState = {
  quantity: string
  definitionId: string
  expiresAt: string
  info: string
}

const initialState: FormState = {
  quantity: '100',
  definitionId: '',
  expiresAt: '',
  info: '',
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

export function ActivationCodesGeneratorForm({ definitions }: Props) {
  const [form, setForm] = useState<FormState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [copied, setCopied] = useState(false)

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const selectedDefinition = useMemo(
    () => definitions.find((definition) => String(definition.id) === form.definitionId) ?? null,
    [definitions, form.definitionId],
  )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setResult(null)
    setCopied(false)

    try {
      const payload = {
        quantity: Number(form.quantity),
        definitionId: Number(form.definitionId),
        expiresAt: form.expiresAt.trim() || null,
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
        Generate activation code batches from reusable definitions.
      </p>

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

          <label style={{ gridColumn: 'span 2' }}>
            Definition
            <select
              style={fieldStyle()}
              value={form.definitionId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                updateField('definitionId', e.target.value)
              }
              required
            >
              <option value="">Select definition...</option>
              {definitions.map((definition) => (
                <option key={definition.id} value={definition.id}>
                  {definition.name} - {definition.productName} / {definition.variantName}
                </option>
              ))}
            </select>
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
        </div>

        {selectedDefinition ? (
          <div
            style={{
              marginTop: 12,
              border: '1px solid var(--theme-elevation-250)',
              borderRadius: 8,
              padding: 12,
              background: 'var(--theme-elevation-0)',
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Selected:</strong> {selectedDefinition.productName} /{' '}
              {selectedDefinition.variantName}
            </p>
            <p style={{ margin: '6px 0 0 0' }}>
              <strong>Mode:</strong>{' '}
              {selectedDefinition.actionType === 'upgrade_replace'
                ? 'Upgrade (Replace)'
                : 'New Purchase'}
            </p>
            {selectedDefinition.actionType === 'upgrade_replace' ? (
              <p style={{ margin: '6px 0 0 0' }}>
                <strong>Allowed From Variants:</strong>{' '}
                {selectedDefinition.allowedFromVariantNames.length > 0
                  ? selectedDefinition.allowedFromVariantNames.join(', ')
                  : 'None configured'}
              </p>
            ) : null}
            <p style={{ margin: '6px 0 0 0' }}>
              <strong>Versions:</strong> {selectedDefinition.versionFrom} -{' '}
              {selectedDefinition.versionTo}
            </p>
            <p style={{ margin: '6px 0 0 0' }}>
              <strong>Trial:</strong> {selectedDefinition.trial ? 'Yes' : 'No'}
            </p>
            <p style={{ margin: '6px 0 0 0' }}>
              <strong>Max Installations:</strong> {selectedDefinition.maxInstallations}
            </p>
            <p style={{ margin: '6px 0 0 0' }}>
              <strong>Valid Days:</strong>{' '}
              {selectedDefinition.validDays ? selectedDefinition.validDays : 'Unlimited'}
            </p>
            <p style={{ margin: '6px 0 0 0' }}>
              <strong>Seller:</strong> {selectedDefinition.sellerName ?? 'None'}
            </p>
            <p style={{ margin: '6px 0 0 0' }}>
              <strong>Lifetime Assign:</strong>{' '}
              {selectedDefinition.assignSellerAsLifetime ? 'Yes' : 'No'}
            </p>
          </div>
        ) : null}

        <label style={{ display: 'block', marginTop: 12 }}>
          Internal info (optional, batch/code note)
          <textarea
            style={{ ...fieldStyle(), minHeight: 80 }}
            value={form.info}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('info', e.target.value)}
          />
        </label>

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
