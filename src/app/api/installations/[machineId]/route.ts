/**
 * GET  /api/installations/[machineId] — Quick revalidation by token + machineId
 * DELETE /api/installations/[machineId] — Deactivate installation by token + machineId
 *
 * Both endpoints use the `token` header for authentication.
 * The machineId is the dynamic route parameter.
 *
 * These endpoints are consumed by the JUCE desktop application.
 */
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { juceErrorXml } from '@/lib/juceRSA'
import { getInstallationByToken, removeInstallation } from '@/lib/installationsHelper'

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
 * GET: Validate installation — returns the stored certificate if
 * the token matches and the machineId is correct.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ machineId: string }> },
) {
  const { machineId: mach } = await params
  const token = req.headers.get('token')

  if (!token || !mach) return errorResponse('Authorization failed')

  const payload = await getPayload({ config })
  const installation = await getInstallationByToken(payload, token)

  if (
    !installation ||
    (installation as { disabled?: boolean }).disabled ||
    (installation as { machineId?: string }).machineId !== mach ||
    !(installation as { certificate?: string }).certificate
  ) {
    return errorResponse('Authorization failed')
  }

  // Check user is not blocked
  const user = installation.user as { blocked?: boolean } | undefined
  if (user?.blocked) return errorResponse('Authorization failed')

  let certificate: string
  try {
    certificate = Buffer.from(
      (installation as { certificate: string }).certificate,
      'base64',
    ).toString('utf-8')
  } catch {
    return errorResponse('Authorization failed')
  }

  return xmlResponse(certificate)
}

/**
 * DELETE: Remove an installation, freeing up an installation slot.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ machineId: string }> },
) {
  const { machineId: mach } = await params
  const token = req.headers.get('token')

  if (!mach || !token) return errorResponse('Not authorized')

  const payload = await getPayload({ config })
  const installation = await getInstallationByToken(payload, token)

  if (!installation || (installation as { machineId?: string }).machineId !== mach) {
    return errorResponse('Not authorized')
  }

  await removeInstallation(payload, installation.id as number)

  return new Response('Installation deleted', { status: 200 })
}
