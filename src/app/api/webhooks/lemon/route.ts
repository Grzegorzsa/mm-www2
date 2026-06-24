/**
 * This is a Next.js API route that handles webhooks from Lemon Squeezy.
 * It verifies the signature of incoming requests to ensure they are from Lemon Squeezy,
 * processes the event data, and creates or updates user, order, and license records in the Payload CMS.
 */

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sendPurchaseWelcomeEmail } from '@/lib/licenseHelper'
import { isBannedEmailDomain, TEMP_EMAIL_REJECT_MESSAGE } from '@/lib/bannedDomains'

type RelationValue = string | number | { id?: string | number } | null | undefined
type OfferActionType = 'new_purchase' | 'upgrade_replace' | 'renewal'

function getRelationId(value: RelationValue): string | number | undefined {
  if (!value) return undefined
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'object' && value.id) return value.id
  return undefined
}

function getRelationIds(values: unknown): Array<string | number> {
  if (!Array.isArray(values)) return []
  return values
    .map((value) => getRelationId(value as RelationValue))
    .filter((value): value is string | number => value !== undefined)
}

function asNumberId(value: string | number | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function asNumberFromUnknown(value: unknown): number | undefined {
  if (typeof value === 'number' || typeof value === 'string') {
    return asNumberId(value)
  }

  return undefined
}

function getNumberRelationIds(values: unknown): number[] {
  return getRelationIds(values)
    .map((value) => asNumberId(value))
    .filter((value): value is number => value !== undefined)
}

function getLicenseVariantIds(license: any): number[] {
  return getNumberRelationIds(license?.productVariants)
}

function mapActionToTransactionType(actionType: string): 'new_purchase' | 'upgrade' | 'renewal' {
  if (actionType === 'upgrade_replace') return 'upgrade'
  if (actionType === 'renewal') return 'renewal'
  return 'new_purchase'
}

function normalizeOfferActionType(value: unknown): OfferActionType {
  if (value === 'upgrade_replace' || value === 'renewal') return value
  return 'new_purchase'
}

// Funkcja weryfikująca, czy żądanie rzeczywiście pochodzi z Lemon Squeezy
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const checksum = Buffer.from(signature, 'utf8')
    return crypto.timingSafeEqual(digest, checksum)
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET

  const badRequest = (message: string, details?: Record<string, unknown>) => {
    console.error('[webhooks/lemon] 400', {
      message,
      ...(details || {}),
    })
    return new NextResponse(message, { status: 400 })
  }

  if (!webhookSecret) {
    console.error('Missing LEMON_SQUEEZY_WEBHOOK_SECRET in environment variables.')
    return new NextResponse('Webhook configuration error', { status: 500 })
  }

  // 1. Odczytujemy surowe ciało żądania do weryfikacji sygnatury
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') || ''

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  // 2. Parsujemy dane zdarzenia
  const event = JSON.parse(rawBody)
  const eventName = typeof event?.meta?.event_name === 'string' ? event.meta.event_name : 'unknown'
  const customData = event.meta?.custom_data || {}
  const flowFromCheckout =
    typeof customData?.flow === 'string' ? normalizeOfferActionType(customData.flow) : undefined
  const requestedOfferId = asNumberFromUnknown(
    customData?.commerceOfferId ?? customData?.commerce_offer_id,
  )
  const requestedUserId = asNumberFromUnknown(customData?.userId ?? customData?.user_id)
  const requestedSourceLicenseId = asNumberFromUnknown(
    customData?.currentLicenseId ?? customData?.current_license_id,
  )
  const requestedSourceVariantId = asNumberFromUnknown(
    customData?.sourceVariantId ?? customData?.source_variant_id,
  )
  const requestedTargetVariantId = asNumberFromUnknown(
    customData?.targetVariantId ?? customData?.target_variant_id,
  )
  const expectedCheckoutEmail =
    typeof customData?.user_email === 'string'
      ? customData.user_email
      : typeof customData?.userEmail === 'string'
        ? customData.userEmail
        : undefined

  if (eventName !== 'order_created') {
    console.info('[webhooks/lemon] Ignoring non-order event', {
      eventName,
      externalOrderId: event?.data?.id,
    })
    return NextResponse.json({ success: true, skipped: true, eventName })
  }

  // --- MAPOWANIE STRUKTURY ZGODNIE Z REALNYM PAYLOADEM ---
  const orderAttributes = event.data?.attributes
  const customerEmail = orderAttributes?.user_email
  const customerName = orderAttributes?.user_name || 'Client'
  const lemonOrderId = event.data?.id ? String(event.data.id) : undefined
  const lemonOrderNumberRaw = orderAttributes?.order_number ?? orderAttributes?.number
  const externalOrderId = lemonOrderNumberRaw ? String(lemonOrderNumberRaw) : lemonOrderId
  const totalAmountInCents = orderAttributes?.total

  // Wyciągamy cyfrowe variant_id z obiektu first_order_item
  const lemonVariantId = orderAttributes?.first_order_item?.variant_id
    ? String(orderAttributes.first_order_item.variant_id)
    : undefined

  console.info('[webhooks/lemon] Received order_created', {
    eventName,
    externalOrderId,
    lemonOrderId,
    lemonVariantId,
    customerEmail,
    totalAmountInCents,
    customData: JSON.stringify(customData),
  })

  if (!customerEmail) {
    return badRequest('Missing customer email in event data', {
      eventName,
      externalOrderId,
      lemonVariantId,
    })
  }

  if (
    expectedCheckoutEmail &&
    customerEmail.toLowerCase().trim() !== expectedCheckoutEmail.toLowerCase().trim()
  ) {
    console.warn('[webhooks/lemon] Checkout email differs from expected user email', {
      eventName,
      externalOrderId,
      lemonVariantId,
      customerEmail,
      expectedCheckoutEmail,
      requestedUserId,
    })
  }

  const blockedDomain = await isBannedEmailDomain(payload, customerEmail)
  if (blockedDomain) {
    return badRequest(TEMP_EMAIL_REJECT_MESSAGE, {
      eventName,
      externalOrderId,
      customerEmail,
    })
  }

  if (!externalOrderId) {
    return badRequest('Missing external order ID in event data', {
      eventName,
      customerEmail,
      lemonVariantId,
    })
  }

  if (!lemonVariantId) {
    return badRequest('Missing variant ID in event data', {
      eventName,
      externalOrderId,
      customerEmail,
    })
  }

  let licenseTransaction: any = null

  try {
    // 2.1 Idempotency guard — repeated webhook for the same external order should be a no-op
    const existingOrder = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { source: { equals: 'lemon_squeezy' } },
          {
            or: [
              { externalOrderId: { equals: String(externalOrderId) } },
              ...(lemonOrderId ? [{ lemonOrderId: { equals: lemonOrderId } }] : []),
            ],
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existingOrder.docs.length > 0) {
      return NextResponse.json({
        success: true,
        cached: true,
        orderId: existingOrder.docs[0].id,
      })
    }

    // 3. Znajdź lub utwórz użytkownika (klienta) w systemie
    let userRecord: any = null
    let generatedPassword: string | null = null
    if (flowFromCheckout === 'upgrade_replace' && !requestedUserId) {
      return badRequest('Upgrade checkout is missing initiating user metadata', {
        eventName,
        externalOrderId,
        flowFromCheckout,
        customerEmail,
      })
    }

    if (requestedUserId) {
      const userById = await payload.findByID({
        collection: 'users',
        id: requestedUserId,
        depth: 0,
        overrideAccess: true,
      })

      if (!userById) {
        return badRequest('Initiating user from checkout metadata was not found', {
          eventName,
          externalOrderId,
          requestedUserId,
          customerEmail,
        })
      }

      userRecord = userById
    } else {
      const usersSearch = await payload.find({
        collection: 'users',
        where: { email: { equals: customerEmail } },
        limit: 1,
      })

      if (usersSearch.docs.length > 0) {
        userRecord = usersSearch.docs[0]
      } else {
        // Jeśli użytkownik kupił produkt, a nie ma konta – tworzymy je automatycznie
        generatedPassword = crypto.randomBytes(16).toString('hex')

        userRecord = await payload.create({
          collection: 'users',
          disableVerificationEmail: true, // Opcjonalnie: blokuje wysyłkę standardowego maila aktywacyjnego Payload, jeśli jest włączona
          req: {
            ...req,
            // Wstrzykujemy flagę do kontekstu, którą odczyta nasz hook w kolekcji Users -
            //  zapobiegamy generowaniu darmowych licencji powitalnych przy zakupie
            context: {
              preventWelcomeLicenses: true,
            },
          } as any,
          data: {
            email: customerEmail,
            name: customerName,
            password: generatedPassword,
            _verified: true,
          } as any,
        })
      }
    }

    console.info('[webhooks/lemon] Resolved assignee user', {
      externalOrderId,
      requestedUserId,
      assignedUserId: userRecord?.id,
      assignedUserEmail: userRecord?.email,
      payerEmail: customerEmail,
    })

    // 4. Resolve rule from commerce-offers (policy-driven), then fallback to legacy direct variant mapping.
    let offerRecord: any = null

    if (flowFromCheckout === 'upgrade_replace' && !requestedOfferId && !requestedTargetVariantId) {
      return badRequest('Upgrade checkout is missing required metadata', {
        externalOrderId,
        lemonVariantId,
        flowFromCheckout,
      })
    }

    if (requestedOfferId) {
      const offerById = await payload.findByID({
        collection: 'commerce-offers',
        id: requestedOfferId,
        depth: 2,
        overrideAccess: true,
      })

      const offerAction = normalizeOfferActionType(offerById?.actionType)

      if (
        offerById &&
        offerById.active === true &&
        (!flowFromCheckout || offerAction === flowFromCheckout)
      ) {
        offerRecord = offerById
      }
    }

    if (!offerRecord) {
      const offerWhere: any[] = [{ active: { equals: true } }]

      if (flowFromCheckout) {
        offerWhere.push({ actionType: { equals: flowFromCheckout } })
      }

      if (requestedTargetVariantId) {
        offerWhere.push({ targetVariant: { equals: requestedTargetVariantId } })
      } else {
        offerWhere.push({ lemonSqueezyVariantId: { equals: lemonVariantId } })
      }

      const offerSearch = await payload.find({
        collection: 'commerce-offers',
        where: {
          and: offerWhere,
        },
        sort: '-createdAt',
        limit: 1,
        depth: 2,
        overrideAccess: true,
      })

      offerRecord = offerSearch.docs[0] ?? null
    }

    if (!offerRecord && flowFromCheckout === 'upgrade_replace') {
      return badRequest('Upgrade offer metadata did not match any active offer', {
        externalOrderId,
        lemonVariantId,
        flowFromCheckout,
        requestedOfferId,
        requestedTargetVariantId,
      })
    }

    let offerActionType: OfferActionType = 'new_purchase'
    let productVariantRecord: any = null
    let productData: any = null
    let productId: number | undefined
    let versionFrom = 1
    let versionTo = 1

    if (offerRecord) {
      offerActionType = normalizeOfferActionType(offerRecord.actionType)

      if (typeof offerRecord.targetVariant === 'object' && offerRecord.targetVariant?.id) {
        productVariantRecord = offerRecord.targetVariant
      } else {
        const targetVariantId = asNumberId(
          getRelationId(offerRecord.targetVariant as RelationValue),
        )
        if (targetVariantId) {
          productVariantRecord = await payload.findByID({
            collection: 'product-variants',
            id: targetVariantId,
            depth: 2,
            overrideAccess: true,
          })
        }
      }

      if (!productVariantRecord) {
        return badRequest('Offer target variant not configured', {
          externalOrderId,
          offerId: offerRecord.id,
        })
      }

      productData =
        typeof productVariantRecord.product === 'object' ? productVariantRecord.product : null
      productId = asNumberId(
        getRelationId(offerRecord.product as RelationValue) ||
          getRelationId(productVariantRecord.product as RelationValue),
      )

      if (!productId) {
        return badRequest('Offer product mapping not configured', {
          externalOrderId,
          offerId: offerRecord.id,
          targetVariantId: productVariantRecord?.id,
        })
      }

      versionFrom = Number(offerRecord.versionFrom ?? productData?.versionNo ?? 1)
      versionTo = Number(offerRecord.versionTo ?? versionFrom)
    } else {
      const variantSearch = await payload.find({
        collection: 'product-variants',
        where: { lemonSqueezyVariantId: { equals: lemonVariantId } },
        limit: 1,
        depth: 2,
        overrideAccess: true,
      })

      if (variantSearch.docs.length === 0) {
        console.error(`Product variant with UID/LemonID ${lemonVariantId} not found in database.`)
        return badRequest('Product variant not mapped', {
          externalOrderId,
          lemonVariantId,
        })
      }

      productVariantRecord = variantSearch.docs[0]
      productData =
        typeof productVariantRecord.product === 'object' ? productVariantRecord.product : null
      productId = asNumberId(getRelationId(productVariantRecord.product as RelationValue))

      if (!productId) {
        return badRequest('Product mapping is invalid for variant', {
          externalOrderId,
          lemonVariantId,
          targetVariantId: productVariantRecord?.id,
        })
      }

      versionFrom = Number(productData?.versionNo ?? 1)
      versionTo = Number(productData?.versionNo ?? 1)
    }

    const applicationName = String(productData?.name ?? 'MXbeats')
    const variantName = String(
      productVariantRecord?.description ?? productVariantRecord?.name ?? '',
    ).trim()

    let sourceLicense: any = null
    let sourceVariantId: number | undefined

    if (offerRecord && offerActionType === 'upgrade_replace') {
      const allowedFromVariantIds = new Set(getNumberRelationIds(offerRecord.allowedFromVariants))
      const denyFromVariantIds = new Set(getNumberRelationIds(offerRecord.denyFromVariants))

      const isEligibleSourceLicense = (license: any) => {
        const licenseVariantIds = getLicenseVariantIds(license)
        const hasAllowed =
          allowedFromVariantIds.size === 0 ||
          licenseVariantIds.some((variantId) => allowedFromVariantIds.has(variantId))
        const hasDenied = licenseVariantIds.some((variantId) => denyFromVariantIds.has(variantId))
        return hasAllowed && !hasDenied
      }

      if (requestedSourceLicenseId) {
        const requestedSourceLicense = await payload.findByID({
          collection: 'licenses',
          id: requestedSourceLicenseId,
          depth: 2,
          overrideAccess: true,
        })

        if (
          requestedSourceLicense &&
          requestedSourceLicense.active === true &&
          asNumberId(getRelationId(requestedSourceLicense.user as RelationValue)) ===
            userRecord.id &&
          isEligibleSourceLicense(requestedSourceLicense)
        ) {
          sourceLicense = requestedSourceLicense
        }
      }

      if (!sourceLicense) {
        const activeLicenses = await payload.find({
          collection: 'licenses',
          where: {
            and: [{ user: { equals: userRecord.id } }, { active: { equals: true } }],
          },
          sort: '-createdAt',
          depth: 2,
          limit: 100,
          overrideAccess: true,
        })

        sourceLicense = activeLicenses.docs.find((license) => isEligibleSourceLicense(license))
      }

      if (!sourceLicense) {
        return badRequest('No eligible source license for this upgrade path', {
          externalOrderId,
          userId: userRecord?.id,
          offerId: offerRecord?.id,
          requestedSourceLicenseId,
          requestedSourceVariantId,
        })
      }

      const sourceLicenseVariantIds = getLicenseVariantIds(sourceLicense)
      if (requestedSourceVariantId && sourceLicenseVariantIds.includes(requestedSourceVariantId)) {
        sourceVariantId = requestedSourceVariantId
      } else {
        sourceVariantId =
          sourceLicenseVariantIds.find((variantId) => allowedFromVariantIds.has(variantId)) ||
          sourceLicenseVariantIds[0]
      }

      await payload.update({
        collection: 'licenses',
        id: sourceLicense.id,
        data: {
          active: false,
          deactivatedReason: `Upgraded to ${productVariantRecord?.name || 'new variant'}`,
        },
        overrideAccess: true,
      })
    }

    const normalizedTransactionType = mapActionToTransactionType(offerActionType)

    // 5. LOGIKA AFILIACJI (Nasza strategia hybrydowa)
    let finalAffiliateRecord: any = null
    let calculatedRate = 0
    let payoutStatus: 'none' | 'pending' = 'none'

    // Sprawdzamy najpierw czy w płatności przekazano kod (np. z linku)
    let affiliateCode = customData.affiliate_code || customData.affiliateCode

    // Jeśli nie ma w linku, sprawdzamy czy użytkownik ma przypisanego opiekuna "na stałe"
    if (!affiliateCode && userRecord.referredBy) {
      const parentAffiliate =
        typeof userRecord.referredBy === 'object'
          ? userRecord.referredBy
          : await payload.findByID({ collection: 'affiliates', id: userRecord.referredBy })

      if (parentAffiliate && parentAffiliate.active) {
        finalAffiliateRecord = parentAffiliate
      }
    } else if (affiliateCode) {
      // Szukamy aktywnego afilianta po kodzie z linku
      const affiliateSearch = await payload.find({
        collection: 'affiliates',
        where: {
          and: [{ affiliateCode: { equals: affiliateCode } }, { active: { equals: true } }],
        },
        limit: 1,
      })
      if (affiliateSearch.docs.length > 0) {
        finalAffiliateRecord = affiliateSearch.docs[0]
      }
    }

    // Jeśli znaleźliśmy aktywnego partnera, kalkulujemy stawkę %
    if (finalAffiliateRecord) {
      // Sprawdzamy, czy to jest PIERWSZE zamówienie tego klienta w naszym systemie
      const previousOrders = await payload.find({
        collection: 'orders',
        where: { user: { equals: userRecord.id } },
        limit: 1,
      })

      const isFirstPurchase = previousOrders.docs.length === 0

      if (affiliateCode) {
        // --- KLIENT PRZYSZEDŁ Z LINKU ---
        if (finalAffiliateRecord.linkStrategy?.enabled) {
          if (isFirstPurchase) {
            calculatedRate = finalAffiliateRecord.linkStrategy.firstPurchaseRate
            payoutStatus = 'pending'
          } else if (finalAffiliateRecord.linkStrategy.isLifetime) {
            calculatedRate = finalAffiliateRecord.linkStrategy.subsequentPurchaseRate
            payoutStatus = 'pending'
          }
        }
      } else {
        // --- KLIENT KUPIŁ BEZ LINKU, ALE MA PODPIĘTEGO OPIEKUNA (np. z klucza Player / Trial) ---
        if (finalAffiliateRecord.keyStrategy?.enabled) {
          if (isFirstPurchase) {
            calculatedRate = finalAffiliateRecord.keyStrategy.commissionRate
            payoutStatus = 'pending'
          } else if (finalAffiliateRecord.keyStrategy.isLifetime) {
            calculatedRate = finalAffiliateRecord.keyStrategy.commissionRate
            payoutStatus = 'pending'
          }
        }
      }

      // Zabezpieczenie: Jeśli użytkownik przyszedł z linku po raz pierwszy,
      // przypisujemy tego afilianta na stałe do profilu użytkownika do przyszłych zakupów
      if (isFirstPurchase && affiliateCode) {
        await payload.update({
          collection: 'users',
          id: userRecord.id,
          data: {
            referredBy: finalAffiliateRecord.id,
          },
        })
      }
    }

    // 6. Create a pending transaction record for auditability
    licenseTransaction = await payload.create({
      collection: 'license-transactions',
      data: {
        externalOrderTimestamp: orderAttributes?.created_at,
        user: userRecord.id,
        fromLicense: sourceLicense?.id,
        fromVariant: sourceVariantId,
        toVariant: productVariantRecord.id,
        product: productId,
        transactionType: normalizedTransactionType,
        amountPaidInCents: Number(totalAmountInCents ?? 0),
        status: 'pending',
        info: `Lemon variant ID: ${lemonVariantId}`,
      },
      overrideAccess: true,
    })

    // 7. Tworzymy zamówienie w kolekcji Orders
    const newOrder = await payload.create({
      collection: 'orders',
      data: {
        user: userRecord.id,
        source: 'lemon_squeezy',
        externalOrderId: String(externalOrderId),
        lemonOrderId,
        amount: totalAmountInCents,
        transactionType: normalizedTransactionType,
        licenseTransaction: licenseTransaction.id,
        affiliatePartner: finalAffiliateRecord ? finalAffiliateRecord.id : undefined,
        affiliateRate: calculatedRate > 0 ? calculatedRate : undefined,
        affiliatePayoutStatus: payoutStatus,
      },
      overrideAccess: true,
    })

    // 8. Generujemy i zapisujemy licencję dla użytkownika
    const newLicense = await payload.create({
      collection: 'licenses',
      data: {
        product: productId,
        user: userRecord.id,
        productVariants: [productVariantRecord.id], // Relacja do wariantu jako tablica (hasMany)
        active: true,
        versionFrom,
        versionTo,
        maxInstallations: sourceLicense?.maxInstallations ?? 2,
        order: newOrder.id,
        upgradedFromLicense: sourceLicense?.id,
        upgradeFromVariant: sourceVariantId,
        info: `License automatically provisioned via Lemon Squeezy. External Order ID: ${externalOrderId}`,
      },
      overrideAccess: true,
    })

    // 9. Mark transaction as completed
    await payload.update({
      collection: 'license-transactions',
      id: licenseTransaction.id,
      data: {
        status: 'completed',
        order: newOrder.id,
        toLicense: newLicense.id,
      },
      overrideAccess: true,
    })

    await sendPurchaseWelcomeEmail(payload, {
      email: userRecord.email || customerEmail,
      generatedPassword,
      externalOrderId: String(externalOrderId),
      applicationName,
      variantName: variantName || null,
    })

    return NextResponse.json({ success: true, orderId: newOrder.id })
  } catch (error: any) {
    if (licenseTransaction?.id) {
      try {
        await payload.update({
          collection: 'license-transactions',
          id: licenseTransaction.id,
          data: {
            status: 'failed',
            errorMessage: error?.message || 'Unknown error during webhook processing',
          },
          overrideAccess: true,
        })
      } catch {
        // no-op: avoid masking original error
      }
    }

    console.error('Error processing Lemon Squeezy webhook:', {
      eventName,
      errorMessage: error?.message || 'Unknown error',
      fullError: JSON.stringify(error, null, 2),
    })
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
  }
}
