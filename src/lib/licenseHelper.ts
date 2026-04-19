/**
 * License helper functions.
 *
 * Handles welcome license creation and sending the welcome email on email verification.
 */
import type { Payload } from 'payload'

/**
 * Get all licenses for a user (for the user panel).
 */
async function getUserLicenses(payload: Payload, userId: number) {
  const { docs } = await payload.find({
    collection: 'licenses',
    where: { user: { equals: userId } },
    depth: 2,
    limit: 999,
    overrideAccess: true,
  })
  return docs
}

/**
 * Create welcome licenses for a newly verified user and send the welcome email.
 *
 * Reads the WelcomeLicense collection for templates, creates License records,
 * then reads the WelcomeEmail global for the email template.
 */
async function createWelcomeLicenses(payload: Payload, user: { id: number; email: string }) {
  // 1. Fetch welcome license templates
  const { docs: welcomeLicenses } = await payload.find({
    collection: 'welcome-licenses',
    depth: 2,
    limit: 999,
    overrideAccess: true,
  })

  if (welcomeLicenses.length === 0) return

  // 2. Create a license for each template
  for (const wl of welcomeLicenses) {
    const product = wl.product as { id: number } | undefined
    if (!product) continue

    let validTill: string | undefined
    if (wl.daysValid && wl.daysValid > 0) {
      const date = new Date()
      date.setDate(date.getDate() + wl.daysValid)
      validTill = date.toISOString()
    }

    const extensionIds = ((wl.productExtensions ?? []) as Array<{ id: number }>).map((e) => e.id)

    await payload.create({
      collection: 'licenses',
      data: {
        user: user.id,
        product: product.id,
        info: wl.info ?? undefined,
        validTill: validTill ?? null,
        maxInstallations: wl.maxInstallations,
        versionFrom: wl.versionFrom,
        versionTo: wl.versionTo,
        active: true,
        productExtensions: extensionIds,
      },
      overrideAccess: true,
    })
  }

  // 3. Send welcome email
  try {
    const welcomeEmail = await payload.findGlobal({
      slug: 'welcome-email',
      overrideAccess: true,
    })

    if (welcomeEmail) {
      await payload.sendEmail({
        to: user.email,
        subject: welcomeEmail.subject,
        text: welcomeEmail.text,
        html: welcomeEmail.html,
      })
    }
  } catch (err) {
    console.error('Failed to send welcome email:', err)
  }
}

export { getUserLicenses, createWelcomeLicenses }
