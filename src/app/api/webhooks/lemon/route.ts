import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '@/payload.config'

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
  const eventName = event.meta?.event_name
  const customData = event.meta?.custom_data || {}

  // Interesuje nas tylko pomyślne utworzenie zamówienia
  if (eventName !== 'order_created') {
    return NextResponse.json({ received: true, message: `Ignored event: ${eventName}` })
  }

  const orderAttributes = event.data?.attributes
  const customerEmail = orderAttributes?.customer_email
  const customerName = orderAttributes?.customer_name || 'Client'
  const externalOrderId = event.data?.id // ID zamówienia z Lemon Squeezy
  const totalAmountInCents = orderAttributes?.total // Kwota w centach jako integer

  // Pobieramy ID wariantu z Lemon Squeezy, aby wiedzieć co klient kupił
  const lemonVariantId = String(orderAttributes?.variant_id)

  if (!customerEmail) {
    return new NextResponse('Missing customer email in event data', { status: 400 })
  }

  try {
    // 3. Znajdź lub utwórz użytkownika (klienta) w systemie
    let userRecord: any = null
    const usersSearch = await payload.find({
      collection: 'users',
      where: { email: { equals: customerEmail } },
      limit: 1,
    })

    if (usersSearch.docs.length > 0) {
      userRecord = usersSearch.docs[0]
    } else {
      // Jeśli użytkownik kupił produkt, a nie ma konta – tworzymy je automatycznie
      const temporaryPassword = crypto.randomBytes(16).toString('hex')

      userRecord = await payload.create({
        collection: 'users',
        // Rzutujemy obiekt danych na 'any', aby uciszyć rygorystyczny sprawdzian typów dla pola 'password'
        data: {
          email: customerEmail,
          name: customerName,
          password: temporaryPassword,
        } as any,
      })
    }

    // 4. Szukamy odpowiedniego wariantu produktu na podstawie zmapowanego ID z Lemon Squeezy
    const variantSearch = await payload.find({
      collection: 'product-variants',
      where: { lemonSqueezyVariantId: { equals: lemonVariantId } },
      limit: 1,
    })

    if (variantSearch.docs.length === 0) {
      console.error(`Product variant with UID/LemonID ${lemonVariantId} not found in database.`)
      return new NextResponse('Product variant not mapped', { status: 400 })
    }
    const productVariantRecord = variantSearch.docs[0]
    const productId =
      typeof productVariantRecord.product === 'object'
        ? productVariantRecord.product.id
        : productVariantRecord.product

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

    // 6. Tworzymy zamówienie w kolekcji Orders
    const newOrder = await payload.create({
      collection: 'orders',
      data: {
        user: userRecord.id,
        source: 'lemon_squeezy',
        externalOrderId: String(externalOrderId),
        amount: totalAmountInCents,
        affiliatePartner: finalAffiliateRecord ? finalAffiliateRecord.id : undefined,
        affiliateRate: calculatedRate > 0 ? calculatedRate : undefined,
        affiliatePayoutStatus: payoutStatus,
      },
    })

    // 7. Generujemy i zapisujemy licencję dla użytkownika
    // Konfigurujemy domyślne parametry na sztywno, tak jak w Twojej obecnej strukturze
    await payload.create({
      collection: 'licenses',
      data: {
        product: productId,
        user: userRecord.id,
        productVariants: [productVariantRecord.id], // Relacja do wariantu jako tablica (hasMany)
        active: true,
        versionFrom: 100, // format integer np. v1.0.0 -> 100
        versionTo: 999, // dozwolone aktualizacje do wersji v9.9.9
        maxInstallations: 2,
        order: newOrder.id,
        info: `License automatically provisioned via Lemon Squeezy. External Order ID: ${externalOrderId}`,
      },
    })

    return NextResponse.json({ success: true, orderId: newOrder.id })
  } catch (error: any) {
    console.error('Error processing Lemon Squeezy webhook:', error)
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
  }
}
