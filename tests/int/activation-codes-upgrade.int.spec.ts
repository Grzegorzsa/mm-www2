import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import {
  getValidActivationCode,
  redeemActivationCodeForUser,
  type ActivationCodeRecord,
} from '@/lib/activationCodes'

type MockPayload = {
  find: ReturnType<typeof vi.fn>
  findByID: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

function createMockPayload(): MockPayload {
  return {
    find: vi.fn(),
    findByID: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }
}

function asPayload(mock: MockPayload): Payload {
  return mock as unknown as Payload
}

describe('activation code upgrade flow', () => {
  it('rejects upgrade code validation when allowedFromVariants is missing', async () => {
    const payload = createMockPayload()

    payload.find.mockResolvedValueOnce({
      docs: [
        {
          id: 11,
          code: 'MGX-ABCD-EFGH-IJKL-MNOP',
          definition: {
            id: 3,
            actionType: 'upgrade_replace',
            product: 10,
            productVariant: 20,
            allowedFromVariants: [],
            versionFrom: 1,
            versionTo: 2,
          },
        },
      ],
    })

    const result = await getValidActivationCode(asPayload(payload), 'MGX-ABCD-EFGH-IJKL-MNOP')

    expect(result.code).toBeNull()
    expect(result.error).toBe('Activation code upgrade definition is misconfigured')
  })

  it('upgrades license when user has eligible source license', async () => {
    const payload = createMockPayload()

    const code: ActivationCodeRecord = {
      id: 99,
      code: 'MGX-1111-2222-3333-4444',
      actionType: 'upgrade_replace',
      product: 101,
      productVariant: 202,
      allowedFromVariants: [303],
      versionFrom: 1,
      versionTo: 3,
      trial: false,
      maxInstallations: 2,
      validDays: null,
      expiresAt: null,
      seller: null,
      assignSellerAsLifetime: false,
      redeemedBy: null,
      redeemedAt: null,
    }

    payload.findByID.mockResolvedValueOnce({
      id: 99,
      code: code.code,
      definition: {
        id: 5,
        actionType: 'upgrade_replace',
        product: 101,
        productVariant: 202,
        allowedFromVariants: [303],
        versionFrom: 1,
        versionTo: 3,
      },
      redeemedBy: null,
      redeemedAt: null,
      expiresAt: null,
    })

    payload.find.mockResolvedValueOnce({
      docs: [
        {
          id: 777,
          user: 55,
          active: true,
          trial: false,
          productVariants: [303],
        },
      ],
    })

    payload.create.mockResolvedValueOnce({ id: 888 })
    payload.update.mockResolvedValue({})

    const result = await redeemActivationCodeForUser(asPayload(payload), code, 55, 'panel_redeem')

    expect(result).toEqual({ success: true })

    expect(payload.create).toHaveBeenCalledTimes(1)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'licenses',
        data: expect.objectContaining({
          user: 55,
          product: 101,
          productVariants: [202],
          info: `Upgraded from code ${code.code}`,
          active: true,
        }),
      }),
    )

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'licenses',
        id: 777,
        data: expect.objectContaining({
          active: false,
          deactivatedReason: `Upgraded via activation code ${code.code}`,
        }),
      }),
    )

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'activation-codes',
        id: 99,
        data: expect.objectContaining({
          redeemedBy: 55,
          redeemSource: 'panel_redeem',
        }),
      }),
    )
  })

  it('rejects upgrade when user already owns target variant', async () => {
    const payload = createMockPayload()

    const code: ActivationCodeRecord = {
      id: 100,
      code: 'MGX-ZZZZ-YYYY-XXXX-WWWW',
      actionType: 'upgrade_replace',
      product: 101,
      productVariant: 202,
      allowedFromVariants: [303],
      versionFrom: 1,
      versionTo: 3,
      trial: false,
      maxInstallations: 2,
      validDays: null,
      expiresAt: null,
      seller: null,
      assignSellerAsLifetime: false,
      redeemedBy: null,
      redeemedAt: null,
    }

    payload.findByID.mockResolvedValueOnce({
      id: 100,
      code: code.code,
      definition: {
        id: 6,
        actionType: 'upgrade_replace',
        product: 101,
        productVariant: 202,
        allowedFromVariants: [303],
        versionFrom: 1,
        versionTo: 3,
      },
      redeemedBy: null,
      redeemedAt: null,
      expiresAt: null,
    })

    payload.find.mockResolvedValueOnce({
      docs: [
        {
          id: 778,
          user: 55,
          active: true,
          trial: false,
          productVariants: [202],
        },
      ],
    })

    const result = await redeemActivationCodeForUser(asPayload(payload), code, 55, 'public_redeem')

    expect(result).toEqual({ success: false, error: 'You already own this target variant' })
    expect(payload.create).not.toHaveBeenCalled()

    const licenseUpdateCall = payload.update.mock.calls.find(
      (call) => call[0]?.collection === 'licenses',
    )
    expect(licenseUpdateCall).toBeUndefined()
  })

  it('rejects upgrade when user has no eligible source license', async () => {
    const payload = createMockPayload()

    const code: ActivationCodeRecord = {
      id: 101,
      code: 'MGX-AAAA-BBBB-CCCC-DDDD',
      actionType: 'upgrade_replace',
      product: 101,
      productVariant: 202,
      allowedFromVariants: [303],
      versionFrom: 1,
      versionTo: 3,
      trial: false,
      maxInstallations: 2,
      validDays: null,
      expiresAt: null,
      seller: null,
      assignSellerAsLifetime: false,
      redeemedBy: null,
      redeemedAt: null,
    }

    payload.findByID.mockResolvedValueOnce({
      id: 101,
      code: code.code,
      definition: {
        id: 7,
        actionType: 'upgrade_replace',
        product: 101,
        productVariant: 202,
        allowedFromVariants: [303],
        versionFrom: 1,
        versionTo: 3,
      },
      redeemedBy: null,
      redeemedAt: null,
      expiresAt: null,
    })

    payload.find.mockResolvedValueOnce({
      docs: [
        {
          id: 779,
          user: 55,
          active: true,
          trial: false,
          productVariants: [404],
        },
      ],
    })

    const result = await redeemActivationCodeForUser(asPayload(payload), code, 55, 'public_redeem')

    expect(result).toEqual({
      success: false,
      error: 'No eligible source license found for this upgrade code',
    })
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('rejects redeem when upgrade code is already used', async () => {
    const payload = createMockPayload()

    const code: ActivationCodeRecord = {
      id: 102,
      code: 'MGX-USED-CODE-0000-0000',
      actionType: 'upgrade_replace',
      product: 101,
      productVariant: 202,
      allowedFromVariants: [303],
      versionFrom: 1,
      versionTo: 3,
      trial: false,
      maxInstallations: 2,
      validDays: null,
      expiresAt: null,
      seller: null,
      assignSellerAsLifetime: false,
      redeemedBy: null,
      redeemedAt: null,
    }

    payload.findByID.mockResolvedValueOnce({
      id: 102,
      code: code.code,
      definition: {
        id: 8,
        actionType: 'upgrade_replace',
        product: 101,
        productVariant: 202,
        allowedFromVariants: [303],
        versionFrom: 1,
        versionTo: 3,
      },
      redeemedBy: 55,
      redeemedAt: new Date().toISOString(),
      expiresAt: null,
    })

    const result = await redeemActivationCodeForUser(asPayload(payload), code, 55, 'public_redeem')

    expect(result).toEqual({ success: false, error: 'Activation code has already been used' })
    expect(payload.find).not.toHaveBeenCalled()
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('rejects redeem when upgrade code is expired', async () => {
    const payload = createMockPayload()

    const code: ActivationCodeRecord = {
      id: 103,
      code: 'MGX-EXPR-CODE-0000-0000',
      actionType: 'upgrade_replace',
      product: 101,
      productVariant: 202,
      allowedFromVariants: [303],
      versionFrom: 1,
      versionTo: 3,
      trial: false,
      maxInstallations: 2,
      validDays: null,
      expiresAt: null,
      seller: null,
      assignSellerAsLifetime: false,
      redeemedBy: null,
      redeemedAt: null,
    }

    payload.findByID.mockResolvedValueOnce({
      id: 103,
      code: code.code,
      definition: {
        id: 9,
        actionType: 'upgrade_replace',
        product: 101,
        productVariant: 202,
        allowedFromVariants: [303],
        versionFrom: 1,
        versionTo: 3,
      },
      redeemedBy: null,
      redeemedAt: null,
      expiresAt: '2020-01-01T00:00:00.000Z',
    })

    const result = await redeemActivationCodeForUser(asPayload(payload), code, 55, 'public_redeem')

    expect(result).toEqual({ success: false, error: 'Activation code has expired' })
    expect(payload.find).not.toHaveBeenCalled()
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('rejects trial upgrade when trial for target variant was already activated', async () => {
    const payload = createMockPayload()

    const code: ActivationCodeRecord = {
      id: 104,
      code: 'MGX-TRIA-UPGR-CODE-0001',
      actionType: 'upgrade_replace',
      product: 101,
      productVariant: 202,
      allowedFromVariants: [303],
      versionFrom: 1,
      versionTo: 3,
      trial: true,
      maxInstallations: 2,
      validDays: 14,
      expiresAt: null,
      seller: null,
      assignSellerAsLifetime: false,
      redeemedBy: null,
      redeemedAt: null,
    }

    payload.findByID.mockResolvedValueOnce({
      id: 104,
      code: code.code,
      definition: {
        id: 10,
        actionType: 'upgrade_replace',
        product: 101,
        productVariant: 202,
        allowedFromVariants: [303],
        trial: true,
        versionFrom: 1,
        versionTo: 3,
      },
      redeemedBy: null,
      redeemedAt: null,
      expiresAt: null,
    })

    payload.find
      .mockResolvedValueOnce({
        docs: [
          {
            id: 780,
            user: 55,
            active: true,
            trial: false,
            productVariants: [303],
          },
        ],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [
          {
            id: 781,
            user: 55,
            trial: true,
            product: 101,
            productVariants: [202],
          },
        ],
      })

    const result = await redeemActivationCodeForUser(asPayload(payload), code, 55, 'panel_redeem')

    expect(result).toEqual({
      success: false,
      error: 'Trial for this product and variant has already been activated on your account',
    })
    expect(payload.create).not.toHaveBeenCalled()

    const licenseUpdateCall = payload.update.mock.calls.find(
      (call) => call[0]?.collection === 'licenses',
    )
    expect(licenseUpdateCall).toBeUndefined()
  })
})
