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
    defaultColumns: [
      'code',
      'product',
      'productVariant',
      'expiresAt',
      'seller',
      'redeemedBy',
      'redeemedAt',
    ],
    description:
      'Single-use activation codes for direct license assignment. Supports seller attribution and optional lifetime referral assignment for new users.',
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
          name: 'code',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: {
            width: '40%',
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
            width: '30%',
            description: 'Admin user that generated this code.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          admin: { width: '25%' },
        },
        {
          name: 'productVariant',
          type: 'relationship',
          relationTo: 'product-variants',
          required: true,
          admin: { width: '25%' },
        },
        {
          name: 'versionFrom',
          type: 'number',
          required: true,
          admin: { width: '25%' },
        },
        {
          name: 'versionTo',
          type: 'number',
          required: true,
          admin: { width: '25%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'trial',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '25%',
            description:
              'Marks this code as trial. User can redeem only one trial per product + variant.',
          },
        },
        {
          name: 'maxInstallations',
          type: 'number',
          required: true,
          defaultValue: 2,
          min: 1,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'validDays',
          type: 'number',
          min: 1,
          admin: {
            width: '25%',
            description:
              'Optional license validity in days from redeem date. Leave empty for unlimited validity.',
          },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: {
            width: '25%',
            description: 'Optional expiration date for redeeming this code.',
          },
        },
        {
          name: 'seller',
          type: 'relationship',
          relationTo: 'affiliates',
          admin: {
            width: '25%',
            description: 'Optional seller/affiliate attached to this code.',
          },
        },
        {
          name: 'assignSellerAsLifetime',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '25%',
            description:
              'For public redeem only: assign seller as permanent referral for newly created users.',
          },
        },
      ],
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
        description: 'Optional internal note for this activation code.',
      },
    },
  ],
  timestamps: true,
}

export default ActivationCodes
