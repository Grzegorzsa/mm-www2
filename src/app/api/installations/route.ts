/**
 * POST /api/installations
 *
 * Multi-purpose endpoint consumed by the JUCE desktop application:
 *
 * 1. Email + password auth → create new installation or revalidate existing
 * 2. Token auth → revalidate / refresh certificate
 * 3. Detects machineId changes (prevMach) → auto-updates
 * 4. Enforces maxInstallations limit
 *
 * Request body (application/json or form fields):
 *   email, pw, product, mach, prevMach, token, os, compName, ver
 *
 * Response: XML certificate (text/xml) or XML error
 */
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { juceErrorXml } from '@/lib/juceRSA'
import {
  getUserInstallations,
  getUserByInstallationToken,
  createAndSendNewInstallation,
  updateAndSendExistingInstallation,
  type AuthUser,
} from '@/lib/installationsHelper'

const MAX_INSTALLATIONS = parseInt(process.env.MAX_INSTALLATIONS || '2', 10)

function xmlResponse(xml: string, status = 200) {
  return new Response(xml, {
    status,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

function errorResponse(message: string) {
  return xmlResponse(juceErrorXml(message))
}

/**
 * Authenticate user by email + password using Payload's login.
 */
async function authenticateUserPW(
  email: string,
  password: string,
): Promise<AuthUser & { error?: string }> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
      overrideAccess: true,
    })
    const user = result.user
    if (!user)
      return { id: 0, email: '', error: 'Please provide a valid email address and password.' }
    if ((user as { blocked?: boolean }).blocked)
      return { id: 0, email: '', error: 'User is blocked.' }
    if (!(user as { _verified?: boolean })._verified)
      return { id: 0, email: '', error: 'Please confirm your email address on product page.' }
    return { id: user.id as number, email: user.email }
  } catch {
    return { id: 0, email: '', error: 'Please provide a valid email address and password.' }
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return errorResponse('Invalid request')
  }

  const email = body.email as string | undefined
  const pw = body.pw as string | undefined
  const product = body.product as string | undefined
  const mach = body.mach as string | undefined
  const prevMach = body.prevMach as string | undefined
  const token = body.token as string | undefined
  const os = body.os as string | undefined
  const compName = body.compName as string | undefined
  const ver = parseInt(String(body.ver ?? '0'), 10)

  if (!(email && pw) && !token) {
    return errorResponse('Not authorized')
  }

  const payload = await getPayload({ config })

  // 1. Authenticate the user
  let user: AuthUser & { error?: string }
  if (email && pw) {
    user = await authenticateUserPW(email, pw)
  } else {
    user = await getUserByInstallationToken(payload, token!)
  }

  if (user.error) return errorResponse(user.error)

  // 2. Get all user installations for this product
  const userInstallations = await getUserInstallations(payload, user.email, product!)

  // 3a. No existing installations → create new
  if (userInstallations.length === 0) {
    const cert = await createAndSendNewInstallation(
      payload,
      user,
      mach!,
      product!,
      ver,
      os ?? '',
      compName ?? '',
    )
    return xmlResponse(cert)
  }

  // 3b. Current machine already registered → revalidate
  const currentInstallation = userInstallations.find(
    (i) => (i as { machineId?: string }).machineId === mach,
  )
  if (currentInstallation) {
    const cert = await updateAndSendExistingInstallation(
      payload,
      currentInstallation.id as number,
      false,
      user,
      mach!,
      product!,
      ver,
    )
    return xmlResponse(cert)
  }

  // 3c. Machine ID changed (prevMach matches an existing installation) → auto-update
  const prevInstallation = userInstallations.find(
    (i) => (i as { machineId?: string }).machineId === prevMach,
  )
  if (prevInstallation) {
    const cert = await updateAndSendExistingInstallation(
      payload,
      prevInstallation.id as number,
      mach!,
      user,
      mach!,
      product!,
      ver,
    )
    return xmlResponse(cert)
  }

  // 4. Max installations reached
  if (userInstallations.length >= MAX_INSTALLATIONS) {
    return errorResponse('Maximum number of active installation reached.')
  }

  // 5. Create new installation
  const cert = await createAndSendNewInstallation(
    payload,
    user,
    mach!,
    product!,
    ver,
    os ?? '',
    compName ?? '',
  )
  return xmlResponse(cert)
}
