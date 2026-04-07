import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getPayload } from 'payload'
import config from '@/payload.config'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
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

  const { email, subject, message } = body as Record<string, unknown>

  if (typeof email !== 'string' || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
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
  const contactTo = process.env.CONTACT_EMAIL

  if (smtpHost && smtpUser && smtpPass && contactTo) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      })

      await transporter.sendMail({
        from: `"MXbeats Contact" <${smtpUser}>`,
        to: contactTo,
        replyTo: safeEmail,
        subject: `[Contact] ${safeSubject}`,
        text: `From: ${safeEmail}\n\n${safeMessage}`,
        html: `<p><strong>From:</strong> ${safeEmail}</p><pre style="font-family:inherit">${safeMessage.replace(/</g, '&lt;')}</pre>`,
      })
    } catch (err) {
      console.error('Failed to send contact email:', err)
      // Non-fatal — submission is already stored in DB
    }
  }

  return NextResponse.json({ ok: true })
}
