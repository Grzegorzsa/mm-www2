import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

function normalizeActivationCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

function hasValidActivationCodeFormat(value: string): boolean {
  return /^MGX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(value)
}

const normalizeCodeField: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data || typeof data !== 'object') return data

  const mutableData = data as Record<string, unknown>
  const rawCode = mutableData.code
  if (typeof rawCode === 'string') {
    const normalizedCode = normalizeActivationCode(rawCode)
    if (!hasValidActivationCodeFormat(normalizedCode)) {
      throw new Error('Activation code must match format MGX-XXXX-XXXX-XXXX-XXXX')
    }
    mutableData.code = normalizedCode
  }

  return mutableData
}

export const ActivationCodes: CollectionConfig = {
  slug: 'activation-codes',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'definition', 'expiresAt', 'redeemedBy', 'redeemedAt'],
    description:
      'Single-use activation code instances linked to reusable activation code definitions.',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    create: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
    delete: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  hooks: {
    beforeValidate: [normalizeCodeField],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'definition',
          type: 'relationship',
          relationTo: 'activation-code-definitions',
          required: true,
          index: true,
          admin: {
            width: '30%',
            description: 'Reusable activation code definition referenced by this code instance.',
          },
        },
        {
          name: 'code',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: {
            width: '35%',
            description:
              'Activation code in format MGX-XXXX-XXXX-XXXX-XXXX (X = uppercase letter or digit).',
          },
        },
        {
          name: 'batchId',
          type: 'text',
          index: true,
          admin: {
            width: '30%',
            description: 'Optional generated batch identifier for reporting.',
          },
        },
        {
          name: 'generatedBy',
          type: 'relationship',
          relationTo: 'admin-users',
          admin: {
            width: '35%',
            description: 'Admin user that generated this code.',
          },
        },
      ],
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Optional expiration date for redeeming this specific code instance.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'redeemedBy',
          type: 'relationship',
          relationTo: 'users',
          index: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'redeemedAt',
          type: 'date',
          index: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'redeemSource',
          type: 'select',
          options: [
            { label: 'Public Redeem', value: 'public_redeem' },
            { label: 'User Panel Redeem', value: 'panel_redeem' },
          ],
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      name: 'info',
      type: 'textarea',
      admin: {
        description: 'Optional internal note for this code instance.',
      },
    },
  ],
  timestamps: true,
}

export default ActivationCodes
