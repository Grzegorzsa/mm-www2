import config from '@payload-config'
import nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { isTrustedBrowserOrigin } from '@/lib/browserOrigin'
import { bugReportLimiter, getClientIp } from '@/lib/rateLimiter'

const MAX_SCREENSHOTS = 4
const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024
const MAX_TOTAL_SCREENSHOT_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getRequiredText(formData: FormData, key: string, maxLength: number): string | null {
  const value = formData.get(key)
  if (typeof value !== 'string') return null

  const trimmedValue = value.trim()
  if (!trimmedValue || trimmedValue.length > maxLength) return null
  return trimmedValue
}

function safeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'screenshot'
}

export async function POST(req: NextRequest) {
  if (!isTrustedBrowserOrigin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  if (
    !user ||
    (user as { collection?: string }).collection !== 'users' ||
    (user as { blocked?: boolean }).blocked
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!bugReportLimiter.check(String(user.id))) {
    return NextResponse.json(
      { error: 'Too many reports. Please try again tomorrow.' },
      { status: 429 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const operatingSystem = getRequiredText(formData, 'operatingSystem', 200)
  const applicationVersion = getRequiredText(formData, 'applicationVersion', 100)
  const description = getRequiredText(formData, 'description', 10_000)

  if (!operatingSystem || !applicationVersion || !description) {
    return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 })
  }

  const screenshots = formData
    .getAll('screenshots')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  if (screenshots.length > MAX_SCREENSHOTS) {
    return NextResponse.json(
      { error: `You can attach up to ${MAX_SCREENSHOTS} screenshots.` },
      { status: 400 },
    )
  }

  const totalScreenshotSize = screenshots.reduce((total, screenshot) => total + screenshot.size, 0)
  if (
    screenshots.some(
      (screenshot) =>
        !ALLOWED_IMAGE_TYPES.has(screenshot.type) || screenshot.size > MAX_SCREENSHOT_SIZE,
    ) ||
    totalScreenshotSize > MAX_TOTAL_SCREENSHOT_SIZE
  ) {
    return NextResponse.json(
      { error: 'Screenshots must be JPG, PNG, or WebP files, up to 5 MB each and 10 MB total.' },
      { status: 400 },
    )
  }

  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USERNAME
  const smtpPass = process.env.SMTP_PASSWORD
  const smtpTo = process.env.SMTP_TO

  if (!smtpHost || !smtpUser || !smtpPass || !smtpTo) {
    console.error('Bug report email not sent: Missing SMTP configuration variables.')
    return NextResponse.json(
      { error: 'The reporting service is temporarily unavailable.' },
      { status: 503 },
    )
  }

  try {
    const attachments = await Promise.all(
      screenshots.map(async (screenshot) => ({
        filename: safeFilename(screenshot.name),
        content: Buffer.from(await screenshot.arrayBuffer()),
        contentType: screenshot.type,
      })),
    )
    const email = user.email
    const ip = getClientIp(req)
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: `"MX BEATS" <${smtpUser}>`,
      to: smtpTo,
      replyTo: email,
      subject: `[Bug report] ${applicationVersion} on ${operatingSystem}`,
      text: `User: ${email}\nIP: ${ip}\nOperating system: ${operatingSystem}\nApplication version: ${applicationVersion}\n\nDescription and reproduction steps:\n${description}`,
      html: `<p><strong>User:</strong> ${escapeHtml(email)}</p><p><strong>IP:</strong> ${escapeHtml(ip)}</p><p><strong>Operating system:</strong> ${escapeHtml(operatingSystem)}</p><p><strong>Application version:</strong> ${escapeHtml(applicationVersion)}</p><p><strong>Description and reproduction steps:</strong></p><pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(description)}</pre>`,
      attachments,
    })
  } catch (error) {
    console.error('Failed to send bug report email:', error)
    return NextResponse.json(
      { error: 'The report could not be sent. Please try again later.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
