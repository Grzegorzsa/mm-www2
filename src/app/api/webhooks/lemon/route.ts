import { NextResponse } from 'next/server'
import payload from 'payload'

// Inicjalizacja Payload CMS (jeśli nie jest zainicjalizowany globalnie)
const getPayloadClient = async () => {
  return payload
}

export async function POST(request: Request) {
  console.log('\n-------------------------------------------------------------')
  try {
    // 1. Pobranie surowego body jako tekst (Kluczowe do późniejszej weryfikacji X-Signature)
    const rawBody = await request.text()

    // 2. Pobranie nagłówka z podpisem z Lemon Squeezy
    const signature = request.headers.get('x-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // ==========================================
    // TODO: Weryfikacja podpisu (Włączymy na produkcji)
    // ==========================================
    /*
    const crypto = require('crypto');
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    
    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    */

    // 3. Parsowanie body do obiektu po przejściu (lub ominięciu) walidacji
    const eventData = JSON.parse(rawBody)
    const eventName = eventData.meta.event_name // np. 'order_created'
    const attributes = eventData.data.attributes

    // 4. ARCHITEKTURA ROUTOWANIA ZDARZEŃ (Switch Case)
    const client = await getPayloadClient()

    switch (eventName) {
      case 'order_created':
        // Logika po udanym zakupie
        await handleOrderCreated(attributes, client)
        break

      case 'order_refunded':
        // Logika w przypadku zwrotu pieniędzy
        await handleOrderRefunded(attributes, client)
        break

      default:
        console.log(`[Lemon Squeezy] Ignoruję nieobsługiwane zdarzenie: ${eventName}`)
    }

    // 5. Zawsze zwracamy 200 OK do Lemon Squeezy, żeby nie powtarzali żądania
    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    console.error('[Webhook Error]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    console.log('-------------------------------------------------------------\n')
  }
}

// ==========================================
// FUNKCJE POMOCNICZE (Integracja z Payload CMS)
// ==========================================

async function handleOrderCreated(attributes: any, cms: typeof payload) {
  const userEmail = attributes.user_email
  const variantId = attributes.variant_id // ID zakupionego produktu/cennika
  const orderId = attributes.order_number

  console.log(`[Payload] Procesuję zamówienie #${orderId} dla ${userEmail}`)

  // Tutaj Payload CMS wkracza do akcji:
  // 1. Szukasz użytkownika po adresie email lub tworzysz nowego
  // 2. Tworzysz wpis w kolekcji 'orders'
  // 3. Generujesz klucz licencyjny dla MXGRID i przypisujesz do usera
}

async function handleOrderRefunded(attributes: any, cms: typeof payload) {
  const orderId = attributes.order_number
  console.log(`[Payload] Cofam licencję dla zamówienia #${orderId}`)

  // Logika Payload CMS: zmiana statusu zamówienia na 'refunded' i blokada licencji
}
