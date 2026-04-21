/**
 * POST /api/juce/installations
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
  return xmlResponse(juceErrorXml(message), 400)
}

async function parseRequestBody(req: NextRequest): Promise<Record<string, unknown> | null> {
  const contentType = req.headers.get('content-type')?.toLowerCase() ?? ''

  if (contentType.includes('application/json')) {
    try {
      return (await req.json()) as Record<string, unknown>
    } catch {
      return null
    }
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    try {
      const formData = await req.formData()
      return Object.fromEntries(formData.entries())
    } catch {
      return null
    }
  }

  // Fallback for clients that don't send a content-type header consistently.
  const jsonClone = req.clone()
  try {
    return (await jsonClone.json()) as Record<string, unknown>
  } catch {
    try {
      const formData = await req.formData()
      return Object.fromEntries(formData.entries())
    } catch {
      return null
    }
  }
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
  console.log('--- Received POST request for installation endpoint ---')
  const body = await parseRequestBody(req)
  if (!body) {
    console.log('Failed to parse request body as JSON or form data')
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
  console.log('Request body:', { email, product, mach, prevMach, token, os, compName, ver })

  if (!(email && pw) && !token) {
    console.log('Not authorized')
    return errorResponse('Not authorized')
  }

  const payload = await getPayload({ config })

  // 1. Authenticate the user
  let user: AuthUser & { error?: string }
  if (email && pw) {
    console.log('Authenticating user with email and password')
    user = await authenticateUserPW(email, pw)
  } else {
    console.log('Authenticating user with token')
    user = await getUserByInstallationToken(payload, token!)
  }

  if (user.error) {
    console.log('Authentication failed:', user.error)
    return errorResponse(user.error)
  }

  // 2. Get all user installations for this product
  const userInstallations = await getUserInstallations(payload, user.email, product!)
  console.log('No of installations found for user:', userInstallations.length)
  // console.log('User installations:', userInstallations)

  // 3a. No existing installations → create new
  if (userInstallations.length === 0) {
    console.log('No installations found, creating new one')
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
    console.log('Updating and sending existing installation')
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
    console.log('Updating and sending existing installation')
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
    console.log('Maximum number of active installations reached')
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
  console.log('Created new installation, sending certificate')

  return xmlResponse(cert)
}
