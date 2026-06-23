/**
 * License helper functions.
 *
 * Handles welcome license creation and sending the welcome email on email verification.
 */
import type { Payload } from 'payload'

type PurchaseWelcomeEmailArgs = {
  email: string
  generatedPassword?: string | null
  externalOrderId: string
  internalOrderId: string
  applicationName: string
  variantName?: string | null
}

const PURCHASE_DOWNLOADS_URL = 'https://mxbeats.com/downloads'
const PURCHASE_USER_PANEL_URL = 'https://mxbeats.com/user-panel/'
const PURCHASE_SIGN_IN_URL = 'https://mxbeats.com/sign-in'

function renderTemplate(template: string, variables: Record<string, string>) {
  return Object.entries(variables).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, value)
  }, template)
}

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
    select: {
      product: true,
      productVariants: true,
      validTill: true,
      versionFrom: true,
      versionTo: true,
      active: true,
      createdAt: true,
      info: true,
    },
  })
  return docs
}

/**
 * Create welcome licenses for a newly verified user and send the welcome email.
 *
 * Reads the WelcomeLicense collection for templates, creates License records,
 * then reads the RegisterWelcomeEmail global for the email template.
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

    const variantIds = ((wl.productVariants ?? []) as Array<{ id: number }>).map((e) => e.id)

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
        productVariants: variantIds,
      },
      overrideAccess: true,
    })
  }

  // 3. Send welcome email
  try {
    const welcomeEmail = await payload.findGlobal({
      slug: 'register-welcome-email',
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

async function sendPurchaseWelcomeEmail(payload: Payload, args: PurchaseWelcomeEmailArgs) {
  try {
    const purchaseWelcomeEmail = await payload.findGlobal({
      slug: 'purchase-welcome-email',
      overrideAccess: true,
    })

    const passwordInstructions = args.generatedPassword
      ? 'Use the generated password shown in this email to authorize the desktop application immediately. After logging in, change it from the My Account section in the user panel.'
      : 'No new password was generated for this purchase because your account already existed. Use your current MXbeats password to authorize the desktop application.'

    const variables = {
      applicationName: args.applicationName,
      variantName: args.variantName || '',
      variantDetails: args.variantName ? `Purchased variant: ${args.variantName}` : '',
      loginEmail: args.email,
      loginPassword:
        args.generatedPassword ||
        'Use your existing MXbeats password (no new password was generated).',
      externalOrderId: args.externalOrderId,
      internalOrderId: args.internalOrderId,
      downloadsUrl: PURCHASE_DOWNLOADS_URL,
      userPanelUrl: PURCHASE_USER_PANEL_URL,
      signInUrl: PURCHASE_SIGN_IN_URL,
      passwordInstructions,
      accountSecurityNotice: `Open ${PURCHASE_USER_PANEL_URL} and change your password in My Account as soon as possible.`,
    }

    await payload.sendEmail({
      to: args.email,
      subject: renderTemplate(purchaseWelcomeEmail.subject, variables),
      text: renderTemplate(purchaseWelcomeEmail.text, variables),
      html: renderTemplate(purchaseWelcomeEmail.html, variables),
    })
  } catch (err) {
    console.error('Failed to send purchase welcome email:', err)
  }
}

export { getUserLicenses, createWelcomeLicenses, sendPurchaseWelcomeEmail }
