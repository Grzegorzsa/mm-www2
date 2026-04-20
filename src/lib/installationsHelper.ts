/**
 * Installation helper functions.
 *
 * Ported from mxapi/src/helpers/installationsHelper.ts to work with Payload CMS.
 */
import crypto from 'crypto'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { createCertificate, juceErrorXml } from './juceRSA'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthUser {
  id: number
  email: string
  _verified?: boolean
  blocked?: boolean
  error?: string
}

interface ExtensionInfo {
  uid: string
  name: string
  description?: string | null
  validTill: number
}

interface ProductLicenseInfo {
  id: number
  ver: number
  product: string
  length: number
  validTill: number
  extensions: ExtensionInfo[]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function getPayloadInstance(): Promise<Payload> {
  return getPayload({ config })
}

// ---------------------------------------------------------------------------
// License queries
// ---------------------------------------------------------------------------

/**
 * Get active licenses for a user + product + version combination.
 */
async function getUserProductLicenses(
  payload: Payload,
  userId: number,
  productUid: string,
  ver: number,
) {
  const { docs } = await payload.find({
    collection: 'licenses',
    where: {
      and: [
        { active: { equals: true } },
        { versionFrom: { less_than_equal: ver } },
        { versionTo: { greater_than_equal: ver } },
        {
          or: [
            { validTill: { equals: null } },
            { validTill: { greater_than_equal: new Date().toISOString() } },
          ],
        },
        { user: { equals: userId } },
        { 'product.uid': { equals: productUid } },
      ],
    },
    depth: 2,
    limit: 999,
    overrideAccess: true,
  })
  return docs
}

/**
 * Merge multiple licenses into a single ProductLicenseInfo.
 * Extensions are merged: the longest validity wins per extension uid.
 */
async function getProductLicenseInfo(
  payload: Payload,
  userId: number,
  productUid: string,
  ver: number,
): Promise<ProductLicenseInfo> {
  const licenses = await getUserProductLicenses(payload, userId, productUid, ver)

  const info: ProductLicenseInfo = {
    id: 0,
    ver,
    product: productUid,
    length: licenses.length,
    validTill: 0,
    extensions: [],
  }

  licenses.forEach((license, idx) => {
    const validTill = license.validTill ? new Date(license.validTill).getTime() : 0

    if (idx === 0) {
      info.validTill = validTill
      const product = license.product as { id: number } | undefined
      info.id = product?.id ?? 0
      const exts = (license.productExtensions ?? []) as Array<{
        uid: string
        name: string
        description?: string | null
      }>
      exts.forEach((ext) => {
        info.extensions.push({
          uid: ext.uid,
          name: ext.name,
          description: ext.description,
          validTill,
        })
      })
    } else {
      // Merge validTill — 0 means unlimited
      if (info.validTill !== 0) {
        if (validTill === 0) {
          info.validTill = 0
        } else if (validTill > info.validTill) {
          info.validTill = validTill
        }
      }
      const exts = (license.productExtensions ?? []) as Array<{
        uid: string
        name: string
        description?: string | null
      }>
      exts.forEach((ext) => {
        const existing = info.extensions.find((e) => e.uid === ext.uid)
        if (existing) {
          if (existing.validTill !== 0) {
            if (validTill === 0) {
              existing.validTill = 0
            } else if (validTill > existing.validTill) {
              existing.validTill = validTill
            }
          }
        } else {
          info.extensions.push({
            uid: ext.uid,
            name: ext.name,
            description: ext.description,
            validTill,
          })
        }
      })
    }
  })

  return info
}

// ---------------------------------------------------------------------------
// Installation queries
// ---------------------------------------------------------------------------

/**
 * Get active installations for a user + product.
 */
async function getUserInstallations(payload: Payload, userEmail: string, productUid: string) {
  const { docs } = await payload.find({
    collection: 'installations',
    where: {
      and: [
        { disabled: { equals: false } },
        { 'user.email': { equals: userEmail } },
        { 'product.uid': { equals: productUid } },
      ],
    },
    depth: 1,
    limit: 999,
    overrideAccess: true,
  })
  return docs
}

/**
 * Get all installations for a user (for the user panel).
 */
async function getInstallationsByUserId(payload: Payload, userId: number) {
  const { docs } = await payload.find({
    collection: 'installations',
    where: {
      and: [{ user: { equals: userId } }, { disabled: { equals: false } }],
    },
    depth: 2,
    limit: 999,
    overrideAccess: true,
    select: {
      product: true,
      machineId: true,
      computerName: true,
      os: true,
      disabled: true,
      createdAt: true,
    },
  })
  return docs
}

/**
 * Find an installation by its unique token.
 */
async function getInstallationByToken(payload: Payload, token: string) {
  const { docs } = await payload.find({
    collection: 'installations',
    where: {
      and: [{ token: { equals: token } }, { disabled: { equals: false } }],
    },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

/**
 * Get the user associated with an installation token. Validates confirmed + not blocked.
 */
async function getUserByInstallationToken(
  payload: Payload,
  token: string,
): Promise<AuthUser & { error?: string }> {
  const installation = await getInstallationByToken(payload, token)
  if (!installation) return { id: 0, email: '', error: 'Installation not found' }

  const user = installation.user as
    | { id: number; email: string; _verified?: boolean; blocked?: boolean }
    | undefined
  if (!user) return { id: 0, email: '', error: 'Installation not found' }
  if (!user._verified)
    return { id: 0, email: '', error: 'Please confirm your email address on product page.' }
  if (user.blocked) return { id: 0, email: '', error: 'User is blocked.' }

  return { id: user.id, email: user.email, _verified: user._verified, blocked: user.blocked }
}

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

/**
 * Generate a unique installation token (SHA-1 based).
 */
async function createUniqueToken(payload: Payload): Promise<string> {
  let token = ''
  let unique = false

  while (!unique) {
    const randomStr = Date.now() + '' + Math.random()
    token = crypto.createHash('sha1').update(randomStr).digest('hex')

    const { docs } = await payload.find({
      collection: 'installations',
      where: { token: { equals: token } },
      limit: 1,
      overrideAccess: true,
    })
    unique = docs.length === 0
  }

  return token
}

// ---------------------------------------------------------------------------
// Installation CRUD
// ---------------------------------------------------------------------------

async function createInstallation(
  payload: Payload,
  userId: number,
  productId: number,
  certificate: string,
  token: string,
  os: string,
  compName: string,
  machineId: string,
) {
  await payload.create({
    collection: 'installations',
    data: {
      user: userId,
      product: productId,
      machineId,
      token,
      certificate: Buffer.from(certificate).toString('base64'),
      computerName: compName,
      os,
    },
    overrideAccess: true,
  })
  return token
}

async function updateInstallation(
  payload: Payload,
  installationId: number,
  certificate: string,
  token: string,
  machineId?: string,
) {
  await payload.update({
    collection: 'installations',
    id: installationId,
    data: {
      token,
      certificate: Buffer.from(certificate).toString('base64'),
      ...(machineId ? { machineId } : {}),
    },
    overrideAccess: true,
  })
  return token
}

async function removeInstallation(payload: Payload, installationId: number) {
  await payload.delete({
    collection: 'installations',
    id: installationId,
    overrideAccess: true,
  })
}

// ---------------------------------------------------------------------------
// High-level flows
// ---------------------------------------------------------------------------

/**
 * Create a new installation and return the XML certificate string, or an error XML.
 */
async function createAndSendNewInstallation(
  payload: Payload,
  user: AuthUser,
  mach: string,
  product: string,
  ver: number,
  os: string,
  compName: string,
): Promise<string> {
  const licenseInfo = await getProductLicenseInfo(payload, user.id, product, ver)

  if (!licenseInfo.length) {
    return juceErrorXml(
      "You don't have any valid licenses for the product or all licenses expired.",
    )
  }

  const token = await createUniqueToken(payload)
  const certificate = createCertificate(user.email, user.email, mach, product, token, licenseInfo)
  await createInstallation(payload, user.id, licenseInfo.id, certificate, token, os, compName, mach)

  return certificate
}

/**
 * Update an existing installation (revalidation / machine change) and return the XML certificate.
 */
async function updateAndSendExistingInstallation(
  payload: Payload,
  installationId: number,
  newMachineId: string | false,
  user: AuthUser,
  mach: string,
  product: string,
  ver: number,
): Promise<string> {
  const licenseInfo = await getProductLicenseInfo(payload, user.id, product, ver)

  if (!licenseInfo.length) {
    return juceErrorXml(
      "You don't have any valid licenses for the product or all licenses expired.",
    )
  }

  const token = await createUniqueToken(payload)
  const certificate = createCertificate(user.email, user.email, mach, product, token, licenseInfo)
  await updateInstallation(
    payload,
    installationId,
    certificate,
    token,
    newMachineId ? newMachineId : undefined,
  )

  return certificate
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  getPayloadInstance,
  getUserProductLicenses,
  getProductLicenseInfo,
  getUserInstallations,
  getInstallationsByUserId,
  getInstallationByToken,
  getUserByInstallationToken,
  createUniqueToken,
  createInstallation,
  updateInstallation,
  removeInstallation,
  createAndSendNewInstallation,
  updateAndSendExistingInstallation,
}

export type { AuthUser, ProductLicenseInfo }
