import type { Payload } from 'payload'
import crypto from 'crypto'

type RelationValue = number | string | { id?: number | string } | null | undefined

type ActivationCodeDefinitionShape = {
  id: number
  actionType?: 'new_purchase' | 'upgrade_replace' | null
  product?: RelationValue
  productVariant?: RelationValue
  allowedFromVariants?: RelationValue[] | null
  trial?: boolean | null
  versionFrom?: number | null
  versionTo?: number | null
  maxInstallations?: number | null
  validDays?: number | null
  seller?: RelationValue
  assignSellerAsLifetime?: boolean | null
  info?: string | null
}

type ActivationCodeRawRecord = {
  id: number
  code: string
  definition?: RelationValue | ActivationCodeDefinitionShape
  // Legacy fields kept for backward compatibility with existing DB data
  product?: RelationValue
  productVariant?: RelationValue
  trial?: boolean | null
  versionFrom?: number | null
  versionTo?: number | null
  maxInstallations?: number | null
  validDays?: number | null
  seller?: RelationValue
  assignSellerAsLifetime?: boolean | null
  info?: string | null
  expiresAt?: string | null
  redeemedBy?: RelationValue
  redeemedAt?: string | null
}

export type ActivationCodeRecord = {
  id: number
  code: string
  actionType?: 'new_purchase' | 'upgrade_replace'
  product: RelationValue
  productVariant: RelationValue
  allowedFromVariants?: RelationValue[]
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

function relationName(value: RelationValue): string | null {
  if (typeof value === 'object' && value && 'name' in value && typeof value.name === 'string') {
    return value.name
  }

  return null
}

function isActivationAdminNotificationEnabled(): boolean {
  const raw = process.env.ACTIVATION_ADMIN_NOTIFICATIONS
  if (!raw) return true

  const normalized = raw.trim().toLowerCase()
  return !['0', 'false', 'off', 'no'].includes(normalized)
}

function getActivationAdminRecipients(): string[] {
  const email = process.env.SMTP_TO?.trim().toLowerCase()
  return email ? [email] : []
}

async function sendActivationNotificationToAdmins(args: {
  payload: Payload
  activationCode: ActivationCodeRecord
  actionType: 'new_purchase' | 'upgrade_replace'
  source: 'public_redeem' | 'panel_redeem'
  userId: number
  userEmail: string
  sourceLicenseId: number | null
}): Promise<void> {
  if (!isActivationAdminNotificationEnabled()) return

  const recipients = getActivationAdminRecipients()
  if (recipients.length === 0) return

  const productName = relationName(args.activationCode.product) ?? 'Unknown product'
  const variantName = relationName(args.activationCode.productVariant) ?? 'Unknown variant'
  const sellerId = relationToNumber(args.activationCode.seller)
  const nowIso = new Date().toISOString()

  const subject = `Activation code redeemed: ${args.activationCode.code}`
  const text = [
    'Activation code was redeemed successfully.',
    '',
    `Timestamp: ${nowIso}`,
    `Redeem source: ${args.source}`,
    `User ID: ${String(args.userId)}`,
    `User email: ${args.userEmail}`,
    `Code: ${args.activationCode.code}`,
    `Action type: ${args.actionType}`,
    `Trial: ${args.activationCode.trial ? 'yes' : 'no'}`,
    `Product: ${productName}`,
    `Variant: ${variantName}`,
    `Version range: ${String(args.activationCode.versionFrom)}-${String(args.activationCode.versionTo)}`,
    `Valid days: ${String(args.activationCode.validDays ?? '-')}`,
    `Seller ID: ${String(sellerId ?? '-')}`,
    `Assign seller as lifetime: ${args.activationCode.assignSellerAsLifetime ? 'yes' : 'no'}`,
    `Source license ID: ${String(args.sourceLicenseId ?? '-')}`,
    `Redeemed by user ID: ${String(args.userId)}`,
  ].join('\n')

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 12px;">Activation code redeemed</h2>
      <p style="margin: 0 0 16px;">Code <strong>${args.activationCode.code}</strong> was redeemed successfully.</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
        <tr><td><strong>Timestamp</strong></td><td>${nowIso}</td></tr>
        <tr><td><strong>Redeem source</strong></td><td>${args.source}</td></tr>
        <tr><td><strong>User ID</strong></td><td>${String(args.userId)}</td></tr>
        <tr><td><strong>User email</strong></td><td>${args.userEmail}</td></tr>
        <tr><td><strong>Action type</strong></td><td>${args.actionType}</td></tr>
        <tr><td><strong>Trial</strong></td><td>${args.activationCode.trial ? 'yes' : 'no'}</td></tr>
        <tr><td><strong>Product</strong></td><td>${productName}</td></tr>
        <tr><td><strong>Variant</strong></td><td>${variantName}</td></tr>
        <tr><td><strong>Version range</strong></td><td>${String(args.activationCode.versionFrom)}-${String(args.activationCode.versionTo)}</td></tr>
        <tr><td><strong>Valid days</strong></td><td>${String(args.activationCode.validDays ?? '-')}</td></tr>
        <tr><td><strong>Seller ID</strong></td><td>${String(sellerId ?? '-')}</td></tr>
        <tr><td><strong>Assign seller as lifetime</strong></td><td>${args.activationCode.assignSellerAsLifetime ? 'yes' : 'no'}</td></tr>
        <tr><td><strong>Source license ID</strong></td><td>${String(args.sourceLicenseId ?? '-')}</td></tr>
      </table>
    </div>
  `

  try {
    await args.payload.sendEmail({
      to: recipients,
      subject,
      text,
      html,
    })
  } catch (error) {
    console.error('[activation-codes] Failed to send admin activation notification:', error)
  }
}

function isExpired(expiresAt: string | null | undefined, now = new Date()): boolean {
  if (!expiresAt) return false
  const expiry = new Date(expiresAt).getTime()
  if (!Number.isFinite(expiry)) return false
  return expiry < now.getTime()
}

function relationValuesToNumbers(values: unknown): number[] {
  if (!Array.isArray(values)) return []

  return values
    .map((value) => relationToNumber(value as RelationValue))
    .filter((value): value is number => value !== null)
}

function getValidTillDate(validDays: number, now = new Date()): string {
  const validTill = new Date(now)
  validTill.setDate(validTill.getDate() + validDays)
  return validTill.toISOString()
}

function getDefinitionSource(
  code: ActivationCodeRawRecord,
): ActivationCodeDefinitionShape | undefined {
  if (!code.definition || typeof code.definition !== 'object') return undefined
  return code.definition as ActivationCodeDefinitionShape
}

function resolveActivationCodeRecord(code: ActivationCodeRawRecord): ActivationCodeRecord {
  const definition = getDefinitionSource(code)

  const product = definition?.product ?? code.product ?? null
  const productVariant = definition?.productVariant ?? code.productVariant ?? null

  return {
    id: code.id,
    code: code.code,
    actionType: definition?.actionType === 'upgrade_replace' ? 'upgrade_replace' : 'new_purchase',
    product,
    productVariant,
    allowedFromVariants:
      Array.isArray(definition?.allowedFromVariants) && definition?.allowedFromVariants.length > 0
        ? definition.allowedFromVariants
        : [],
    trial: definition?.trial ?? code.trial ?? false,
    versionFrom: Number(definition?.versionFrom ?? code.versionFrom ?? 0),
    versionTo: Number(definition?.versionTo ?? code.versionTo ?? 0),
    maxInstallations: definition?.maxInstallations ?? code.maxInstallations ?? 2,
    validDays: definition?.validDays ?? code.validDays ?? null,
    expiresAt: code.expiresAt ?? null,
    seller: definition?.seller ?? code.seller ?? null,
    assignSellerAsLifetime:
      definition?.assignSellerAsLifetime ?? code.assignSellerAsLifetime ?? false,
    redeemedBy: code.redeemedBy,
    redeemedAt: code.redeemedAt,
  }
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
    depth: 2,
    overrideAccess: true,
  })

  const rawCodeDoc = result.docs[0] as ActivationCodeRawRecord | undefined
  if (!rawCodeDoc) {
    return { code: null, error: 'Activation code is invalid' }
  }

  const code = resolveActivationCodeRecord(rawCodeDoc)

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

  if (code.actionType === 'upgrade_replace') {
    const allowedFromVariantIds = relationValuesToNumbers(code.allowedFromVariants)
    if (allowedFromVariantIds.length === 0) {
      return { code: null, error: 'Activation code upgrade definition is misconfigured' }
    }
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

  const latestRawCode = (await payload.findByID({
    collection: 'activation-codes',
    id: activationCode.id,
    depth: 2,
    overrideAccess: true,
  })) as ActivationCodeRawRecord

  const latestCode = resolveActivationCodeRecord(latestRawCode)

  if (latestCode.redeemedBy || latestCode.redeemedAt) {
    return { success: false, error: 'Activation code has already been used' }
  }

  if (isExpired(latestCode.expiresAt)) {
    return { success: false, error: 'Activation code has expired' }
  }

  const isTrial = Boolean(latestCode.trial)
  const actionType =
    latestCode.actionType === 'upgrade_replace' ? 'upgrade_replace' : 'new_purchase'

  let sourceLicenseId: number | null = null

  if (actionType === 'upgrade_replace') {
    const allowedFromVariantIds = relationValuesToNumbers(latestCode.allowedFromVariants)
    if (allowedFromVariantIds.length === 0) {
      return { success: false, error: 'Activation code upgrade definition is misconfigured' }
    }

    const activeLicensesResult = await payload.find({
      collection: 'licenses',
      where: {
        and: [{ user: { equals: userId } }, { active: { equals: true } }],
      },
      limit: 300,
      depth: 0,
      overrideAccess: true,
    })

    const alreadyHasTarget = activeLicensesResult.docs.some((license) => {
      const variantIds = relationValuesToNumbers(
        (license as { productVariants?: unknown }).productVariants,
      )
      const isLicenseTrial = Boolean((license as { trial?: boolean | null }).trial)
      return !isLicenseTrial && variantIds.includes(variantId)
    })

    if (alreadyHasTarget) {
      return { success: false, error: 'You already own this target variant' }
    }

    const sourceLicense = activeLicensesResult.docs.find((license) => {
      const variantIds = relationValuesToNumbers(
        (license as { productVariants?: unknown }).productVariants,
      )
      return variantIds.some((variant) => allowedFromVariantIds.includes(variant))
    })

    if (!sourceLicense || !Number.isFinite(sourceLicense.id)) {
      return { success: false, error: 'No eligible source license found for this upgrade code' }
    }

    sourceLicenseId = sourceLicense.id
  }

  if (isTrial) {
    const previousTrialLicenseResult = await payload.find({
      collection: 'licenses',
      where: {
        and: [
          { user: { equals: userId } },
          { product: { equals: productId } },
          { productVariants: { equals: variantId } },
          { trial: { equals: true } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (previousTrialLicenseResult.totalDocs > 0) {
      return {
        success: false,
        error: 'Trial for this product and variant has already been activated on your account',
      }
    }

    // Legacy safety net for old redeemed trial codes created before trial license flag was enforced.
    const previousTrialCodeResult = await payload.find({
      collection: 'activation-codes',
      where: {
        and: [{ redeemedBy: { equals: userId } }, { redeemedAt: { exists: true } }],
      },
      limit: 3000,
      depth: 2,
      overrideAccess: true,
    })

    const hasLegacyTrial = (previousTrialCodeResult.docs as ActivationCodeRawRecord[]).some(
      (doc) => {
        const resolved = resolveActivationCodeRecord(doc)
        if (!resolved.trial) return false
        return (
          relationToNumber(resolved.product) === productId &&
          relationToNumber(resolved.productVariant) === variantId
        )
      },
    )

    if (hasLegacyTrial) {
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
      trial: isTrial,
      active: true,
      info:
        actionType === 'upgrade_replace'
          ? `Upgraded from code ${latestCode.code}`
          : `Activated from code ${latestCode.code}`,
    },
    overrideAccess: true,
  })

  if (actionType === 'upgrade_replace' && sourceLicenseId) {
    await payload.update({
      collection: 'licenses',
      id: sourceLicenseId,
      data: {
        active: false,
        deactivatedReason: `Upgraded via activation code ${latestCode.code}`,
      },
      overrideAccess: true,
    })
  }

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

  let userEmail = `user-${String(userId)}@unknown.local`
  try {
    const userDoc = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
      overrideAccess: true,
      select: {
        email: true,
      },
    })

    const resolvedEmail = (userDoc as { email?: string } | undefined)?.email
    if (typeof resolvedEmail === 'string' && resolvedEmail.trim()) {
      userEmail = resolvedEmail.trim().toLowerCase()
    }
  } catch (error) {
    console.error('[activation-codes] Failed to resolve user email for notification:', error)
  }

  await sendActivationNotificationToAdmins({
    payload,
    activationCode: latestCode,
    actionType,
    source,
    userId,
    userEmail,
    sourceLicenseId,
  })

  return { success: true }
}

export function generateActivationCode(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomChunk = (len: number) =>
    Array.from({ length: len }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join('')

  return `MGX-${randomChunk(4)}-${randomChunk(4)}-${randomChunk(4)}-${randomChunk(4)}`
}
