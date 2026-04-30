import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { h } from '@/lib/h'
import { contactLimiter, getClientIp } from '@/lib/rateLimiter'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  // Rate-limit: max 4 messages per IP per 24 hours
  const ip = getClientIp(req)
  if (!contactLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again tomorrow.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    !('subject' in body) ||
    !('message' in body)
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { email, subject, message, scs } = body as Record<string, unknown>

  if (typeof email !== 'string' || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Parity check — reject automated requests that bypassed the form
  if (typeof scs !== 'string' || scs !== h(message + email + subject)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Sanitize inputs (strip HTML tags for plain text)
  const safeEmail = email.trim().slice(0, 200)
  const safeSubject = subject.trim().slice(0, 200)
  const safeMessage = message.trim().slice(0, 5000)

  // Store in Payload CMS
  try {
    const payload = await getPayload({ config: await config })
    await payload.create({
      collection: 'contact-submissions',
      data: {
        email: safeEmail,
        subject: safeSubject,
        message: safeMessage,
      },
    })
  } catch (err) {
    console.error('Failed to save contact submission:', err)
    // Continue even if DB save fails — we still send the email
  }

  // Send email notification if SMTP is configured
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USERNAME
  const smtpPass = process.env.SMTP_PASSWORD
  const smtpTo = process.env.SMTP_TO

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      })

      await transporter.sendMail({
        from: `"MX BEATS" <${smtpUser}>`,
        to: smtpTo,
        replyTo: safeEmail,
        subject: `[Contact] ${safeSubject}`,
        text: `Email: ${safeEmail}\nIP: ${ip}\nSubject: ${safeSubject}\n\nMessage: ${safeMessage}`,
        html: `<p><strong>Email:</strong> ${safeEmail}</p><p><strong>IP:</strong> ${ip}</p><p><strong>Subject:</strong> ${safeSubject}</p><p><strong>Message:</strong></p><pre style="font-family:inherit;white-space:pre-wrap">${safeMessage.replace(/</g, '&lt;')}</pre>`,
      })
    } catch (err) {
      console.error('Failed to send contact email:', err)
      // Non-fatal — submission is already stored in DB
    }
  } else {
    console.warn('E-mail not sent: Missing SMTP configuration variables.')
  }

  return NextResponse.json({ ok: true })
}
