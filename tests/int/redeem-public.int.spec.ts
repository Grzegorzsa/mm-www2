import { beforeEach, describe, expect, it, vi } from 'vitest'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()

  return {
    ...actual,
    getPayload: vi.fn(),
  }
})

vi.mock('@/lib/browserOrigin', () => ({
  isTrustedBrowserOrigin: vi.fn(() => true),
}))

vi.mock('@/lib/h', () => ({
  h: vi.fn((value: string) => `hash:${value}`),
}))

vi.mock('@/lib/rateLimiter', () => ({
  registerLimiter: {
    check: vi.fn(() => true),
  },
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

vi.mock('@/lib/bannedDomains', () => ({
  isBannedEmailAddress: vi.fn(async () => false),
  isBannedEmailDomain: vi.fn(async () => false),
  TEMP_EMAIL_REJECT_MESSAGE: 'TEMP_EMAIL_REJECT_MESSAGE',
}))

vi.mock('@/lib/activationCodes', () => ({
  getValidActivationCode: vi.fn(),
  redeemActivationCodeForUser: vi.fn(),
}))

vi.mock('@/lib/licenseHelper', () => ({
  sendPurchaseWelcomeEmail: vi.fn(async () => undefined),
}))

import { getPayload } from 'payload'
import { getValidActivationCode, redeemActivationCodeForUser } from '@/lib/activationCodes'
import { sendPurchaseWelcomeEmail } from '@/lib/licenseHelper'
import { POST } from '@/app/api/redeem/public/route'

type MockPayload = {
  find: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

describe('POST /api/redeem/public', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates a password for new user and sends it in purchase welcome email', async () => {
    const generatedPasswordHex = 'a'.repeat(32)

    vi.spyOn(crypto, 'randomBytes').mockImplementation(((size: number) => {
      const chunk = generatedPasswordHex.slice(0, size * 2)
      return Buffer.from(chunk, 'hex')
    }) as never)

    const mockPayload: MockPayload = {
      find: vi.fn(async ({ collection }) => {
        if (collection === 'users') {
          return {
            totalDocs: 0,
            docs: [],
          }
        }

        return {
          totalDocs: 0,
          docs: [],
        }
      }),
      create: vi.fn(async ({ data }) => ({
        id: 321,
        email: data.email,
      })),
    }

    vi.mocked(getPayload).mockResolvedValue(mockPayload as never)

    vi.mocked(getValidActivationCode).mockResolvedValue({
      code: {
        id: 111,
        code: 'MGX-ABCD-EFGH-IJKL-MNOP',
        product: { id: 10, name: 'MX GRID' },
        productVariant: { id: 20, name: 'MX GRID Loops Pro' },
        seller: null,
        assignSellerAsLifetime: false,
      },
      error: null,
    } as never)

    vi.mocked(redeemActivationCodeForUser).mockResolvedValue({ success: true } as never)

    const request = new NextRequest('http://localhost/api/redeem/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'MGX-ABCD-EFGH-IJKL-MNOP',
        email: 'new.user@example.com',
        marketingConsent: true,
        acceptedTerms: true,
        scs: 'hash:new.user@example.com',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)

    expect(mockPayload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        data: expect.objectContaining({
          email: 'new.user@example.com',
          password: generatedPasswordHex,
          _verified: true,
        }),
      }),
    )

    expect(sendPurchaseWelcomeEmail).toHaveBeenCalledWith(
      mockPayload,
      expect.objectContaining({
        email: 'new.user@example.com',
        generatedPassword: generatedPasswordHex,
        variantName: 'MX GRID Loops Pro',
      }),
    )
  })
})
