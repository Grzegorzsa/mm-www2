import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()

  return {
    ...actual,
    getPayload: vi.fn(),
  }
})

vi.mock('@/lib/session', () => ({
  getSessionUser: vi.fn(),
}))

vi.mock('@/lib/bannedDomains', () => ({
  getEmailDomain: vi.fn(() => 'example.com'),
  isBannedEmailAddress: vi.fn(async () => false),
  isBannedEmailDomain: vi.fn(async () => false),
  isBannedDomain: vi.fn(async () => false),
  TEMP_EMAIL_REJECT_MESSAGE: 'TEMP_EMAIL_REJECT_MESSAGE',
}))

vi.mock('@/lib/discountCodes', () => ({
  resolveDiscountCodeForAmount: vi.fn(async () => ({ resolution: null, error: null })),
}))

vi.mock('@/lib/rateLimiter', () => ({
  checkoutUpgradeLimiter: {
    check: vi.fn(() => true),
  },
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

import { getPayload } from 'payload'
import { getSessionUser } from '@/lib/session'
import { POST } from '@/app/api/checkout/upgrade/route'

type MockPayload = {
  find: ReturnType<typeof vi.fn>
  findByID: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

describe('POST /api/checkout/upgrade offer selection priority', () => {
  const originalEnv = {
    LEMON_SQUEEZY_API_KEY: process.env.LEMON_SQUEEZY_API_KEY,
    LEMON_SQUEEZY_STORE_ID: process.env.LEMON_SQUEEZY_STORE_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    process.env.LEMON_SQUEEZY_API_KEY = 'test-key'
    process.env.LEMON_SQUEEZY_STORE_ID = '1234'
    process.env.NEXT_PUBLIC_APP_URL = 'https://mxbeats.com'
  })

  it('prefers upgrade_replace over trial when actionType is not provided', async () => {
    const mockPayload: MockPayload = {
      findByID: vi.fn(async ({ collection, id }) => {
        if (collection !== 'product-variants') return null

        const numericId = typeof id === 'number' ? id : Number(id)

        if (numericId === 200) {
          return {
            id: 200,
            lemonSqueezyVariantId: '999',
            product: 10,
            priceCents: 5000,
          }
        }

        if (numericId === 111) {
          return {
            id: 111,
            lemonSqueezyVariantId: '111',
            product: 10,
            priceCents: 3000,
          }
        }

        throw new Error(`Unexpected variant id ${String(id)}`)
      }),
      find: vi.fn(async ({ collection }) => {
        if (collection === 'licenses') {
          return {
            totalDocs: 1,
            docs: [
              {
                id: 700,
                user: 77,
                active: true,
                trial: false,
                product: 10,
                productVariants: [
                  {
                    id: 111,
                    lemonSqueezyVariantId: '111',
                    isCommercial: true,
                  },
                ],
              },
            ],
          }
        }

        if (collection === 'commerce-offers') {
          return {
            totalDocs: 2,
            docs: [
              {
                id: 900,
                name: 'Trial beats from loops',
                actionType: 'trial',
                targetVariant: 200,
                allowedFromVariants: [111],
                denyFromVariants: [],
                validDays: 7,
              },
              {
                id: 901,
                name: 'Upgrade loops to beats',
                actionType: 'upgrade_replace',
                targetVariant: 200,
                allowedFromVariants: [111],
                denyFromVariants: [],
                referencePriceCents: 1500,
              },
            ],
          }
        }

        return {
          totalDocs: 0,
          docs: [],
        }
      }),
      create: vi.fn(async () => ({ id: 1 })),
    }

    vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
    vi.mocked(getSessionUser).mockResolvedValue({
      id: 77,
      email: 'artist@example.com',
      blocked: false,
    } as never)

    const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null
      const customData = body?.data?.attributes?.checkout_data?.custom

      expect(customData?.flow).toBe('upgrade_replace')
      expect(customData?.commerce_offer_id).toBe('901')

      return {
        ok: true,
        json: async () => ({
          data: {
            attributes: {
              url: 'https://checkout.test/session-1',
            },
          },
        }),
      }
    })

    vi.stubGlobal('fetch', fetchMock)

    const request = new NextRequest('http://localhost/api/checkout/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: 200 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.checkoutUrl).toBe('https://checkout.test/session-1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(mockPayload.create).not.toHaveBeenCalled()
  })

  it('prefers crossgrade over trial when actionType is not provided', async () => {
    const mockPayload: MockPayload = {
      findByID: vi.fn(async ({ collection, id }) => {
        if (collection !== 'product-variants') return null

        const numericId = typeof id === 'number' ? id : Number(id)

        if (numericId === 200) {
          return {
            id: 200,
            lemonSqueezyVariantId: '999',
            product: 20,
            priceCents: 5000,
          }
        }

        if (numericId === 111) {
          return {
            id: 111,
            lemonSqueezyVariantId: '111',
            product: 10,
            priceCents: 3000,
          }
        }

        throw new Error(`Unexpected variant id ${String(id)}`)
      }),
      find: vi.fn(async ({ collection }) => {
        if (collection === 'licenses') {
          return {
            totalDocs: 1,
            docs: [
              {
                id: 701,
                user: 77,
                active: true,
                trial: false,
                product: 10,
                productVariants: [
                  {
                    id: 111,
                    lemonSqueezyVariantId: '111',
                    isCommercial: true,
                  },
                ],
              },
            ],
          }
        }

        if (collection === 'commerce-offers') {
          return {
            totalDocs: 2,
            docs: [
              {
                id: 910,
                name: 'Trial beats from loops',
                actionType: 'trial',
                targetVariant: 200,
                allowedFromVariants: [111],
                denyFromVariants: [],
                validDays: 7,
              },
              {
                id: 911,
                name: 'Crossgrade to beats',
                actionType: 'crossgrade',
                targetVariant: 200,
                allowedFromProducts: [10],
                allowedFromVariants: [111],
                denyFromVariants: [],
                isCommercial: true,
                referencePriceCents: 1700,
              },
            ],
          }
        }

        return {
          totalDocs: 0,
          docs: [],
        }
      }),
      create: vi.fn(async () => ({ id: 1 })),
    }

    vi.mocked(getPayload).mockResolvedValue(mockPayload as never)
    vi.mocked(getSessionUser).mockResolvedValue({
      id: 77,
      email: 'artist@example.com',
      blocked: false,
    } as never)

    const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null
      const customData = body?.data?.attributes?.checkout_data?.custom

      expect(customData?.flow).toBe('crossgrade')
      expect(customData?.commerce_offer_id).toBe('911')

      return {
        ok: true,
        json: async () => ({
          data: {
            attributes: {
              url: 'https://checkout.test/session-2',
            },
          },
        }),
      }
    })

    vi.stubGlobal('fetch', fetchMock)

    const request = new NextRequest('http://localhost/api/checkout/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: 200 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.checkoutUrl).toBe('https://checkout.test/session-2')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(mockPayload.create).not.toHaveBeenCalled()
  })

  afterAll(() => {
    process.env.LEMON_SQUEEZY_API_KEY = originalEnv.LEMON_SQUEEZY_API_KEY
    process.env.LEMON_SQUEEZY_STORE_ID = originalEnv.LEMON_SQUEEZY_STORE_ID
    process.env.NEXT_PUBLIC_APP_URL = originalEnv.NEXT_PUBLIC_APP_URL
  })
})
