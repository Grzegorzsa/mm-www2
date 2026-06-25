import type { Payload } from 'payload'

type RelationValue = number | string | { id?: number | string } | null | undefined

export type ActivationCodeRecord = {
  id: number
  code: string
  product: RelationValue
  productVariant: RelationValue
  trial?: boolean | null
  versionFrom: number
  versionTo: number
  maxInstallations?: number | null
  validDays?: number | null
  expiresAt?: string | null
  seller?: RelationValue
  assignSellerAsLifetime?: boolean | null
  redeemedBy?: RelationValue
  redeemedAt?: string | null
}

export function normalizeActivationCodeInput(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

export function isActivationCodeFormatValid(value: string): boolean {
  return /^MGX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(value)
}

function relationToNumber(value: RelationValue): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (typeof value === 'object' && value && 'id' in value) {
    return relationToNumber(value.id)
  }
  return null
}

function isExpired(expiresAt: string | null | undefined, now = new Date()): boolean {
  if (!expiresAt) return false
  const expiry = new Date(expiresAt).getTime()
  if (!Number.isFinite(expiry)) return false
  return expiry < now.getTime()
}

function getValidTillDate(validDays: number, now = new Date()): string {
  const validTill = new Date(now)
  validTill.setDate(validTill.getDate() + validDays)
  return validTill.toISOString()
}

export async function getValidActivationCode(
  payload: Payload,
  rawCode: string,
): Promise<{ code: ActivationCodeRecord | null; error: string | null }> {
  const normalizedCode = normalizeActivationCodeInput(rawCode)
  if (!normalizedCode) {
    return { code: null, error: 'Activation code is required' }
  }

  const result = await payload.find({
    collection: 'activation-codes',
    where: { code: { equals: normalizedCode } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  const code = result.docs[0] as ActivationCodeRecord | undefined
  if (!code) {
    return { code: null, error: 'Activation code is invalid' }
  }

  if (code.redeemedBy || code.redeemedAt) {
    return { code: null, error: 'Activation code has already been used' }
  }

  if (isExpired(code.expiresAt)) {
    return { code: null, error: 'Activation code has expired' }
  }

  const productId = relationToNumber(code.product)
  const variantId = relationToNumber(code.productVariant)

  if (
    !productId ||
    !variantId ||
    !Number.isFinite(code.versionFrom) ||
    !Number.isFinite(code.versionTo)
  ) {
    return { code: null, error: 'Activation code is misconfigured' }
  }

  return { code, error: null }
}

export async function redeemActivationCodeForUser(
  payload: Payload,
  activationCode: ActivationCodeRecord,
  userId: number,
  source: 'public_redeem' | 'panel_redeem',
): Promise<{ success: boolean; error?: string }> {
  const productId = relationToNumber(activationCode.product)
  const variantId = relationToNumber(activationCode.productVariant)

  if (!productId || !variantId) {
    return { success: false, error: 'Activation code is misconfigured' }
  }

  const latestCode = await payload.findByID({
    collection: 'activation-codes',
    id: activationCode.id,
    depth: 0,
    overrideAccess: true,
  })

  if (latestCode.redeemedBy || latestCode.redeemedAt) {
    return { success: false, error: 'Activation code has already been used' }
  }

  if (isExpired(latestCode.expiresAt)) {
    return { success: false, error: 'Activation code has expired' }
  }

  const isTrial = Boolean(latestCode.trial)

  if (isTrial) {
    const previousTrialResult = await payload.find({
      collection: 'activation-codes',
      where: {
        and: [
          { trial: { equals: true } },
          { redeemedBy: { equals: userId } },
          { product: { equals: productId } },
          { productVariant: { equals: variantId } },
          { redeemedAt: { exists: true } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (previousTrialResult.totalDocs > 0) {
      return {
        success: false,
        error: 'Trial for this product and variant has already been activated on your account',
      }
    }
  }

  const parsedValidDays =
    typeof latestCode.validDays === 'number' &&
    Number.isInteger(latestCode.validDays) &&
    latestCode.validDays > 0
      ? latestCode.validDays
      : null

  await payload.create({
    collection: 'licenses',
    data: {
      user: userId,
      product: productId,
      productVariants: [variantId],
      versionFrom: latestCode.versionFrom,
      versionTo: latestCode.versionTo,
      maxInstallations: latestCode.maxInstallations ?? 2,
      ...(parsedValidDays ? { validTill: getValidTillDate(parsedValidDays) } : {}),
      active: true,
      info: `Activated from code ${latestCode.code}`,
    },
    overrideAccess: true,
  })

  await payload.update({
    collection: 'activation-codes',
    id: latestCode.id,
    data: {
      redeemedBy: userId,
      redeemedAt: new Date().toISOString(),
      redeemSource: source,
    },
    overrideAccess: true,
  })

  return { success: true }
}

export function generateActivationCode(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomChunk = (len: number) =>
    Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
      '',
    )

  return `MGX-${randomChunk(4)}-${randomChunk(4)}-${randomChunk(4)}-${randomChunk(4)}`
}
