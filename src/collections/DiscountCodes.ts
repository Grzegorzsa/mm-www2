import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

function normalizeDiscountCode(value: string): string {
  return value.trim().toLowerCase()
}

const normalizeCodeField: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data || typeof data !== 'object') return data

  const mutableData = data as Record<string, unknown>
  const rawCode = mutableData.code
  if (typeof rawCode === 'string') {
    mutableData.code = normalizeDiscountCode(rawCode)
  }

  return mutableData
}

export const DiscountCodes: CollectionConfig = {
  slug: 'discount-codes',
  admin: {
    useAsTitle: 'code',
    defaultColumns: [
      'code',
      'active',
      'discountType',
      'discountValue',
      'maxUses',
      'startsAt',
      'endsAt',
    ],
    description:
      'Discount codes for checkout pricing, affiliate attribution, and lifetime referral rules.',
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
            description: 'Case-insensitive discount code, stored normalized to lowercase.',
          },
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '20%',
          },
        },
        {
          name: 'discountType',
          type: 'select',
          required: true,
          defaultValue: 'percentage',
          options: [
            { label: 'Percentage', value: 'percentage' },
            { label: 'Fixed amount', value: 'fixed_amount' },
          ],
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'discountValue',
          type: 'number',
          required: true,
          min: 1,
          validate: (value: unknown, { siblingData }: { siblingData?: unknown }) => {
            if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
              return 'Discount value must be a positive number.'
            }

            const discountType =
              typeof siblingData === 'object' && siblingData
                ? (siblingData as { discountType?: string }).discountType
                : undefined

            if (discountType === 'percentage' && value > 100) {
              return 'Percentage discount cannot exceed 100%.'
            }

            return true
          },
          admin: {
            width: '30%',
            description:
              'Percentage value (e.g. 10) or fixed amount in cents (e.g. 1000 for 10 USD).',
          },
        },
        {
          name: 'minimumSubtotalCents',
          type: 'number',
          defaultValue: 1000,
          min: 0,
          admin: {
            width: '35%',
            description: 'Minimum checkout subtotal after discount. Default: 1000 cents (10 USD).',
          },
        },
        {
          name: 'maxUses',
          type: 'number',
          min: 1,
          admin: {
            width: '35%',
            description: 'Optional usage cap. Leave empty for unlimited redemptions.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startsAt',
          type: 'date',
          admin: {
            width: '50%',
            description: 'Optional start date/time. Leave empty for immediate activation.',
          },
        },
        {
          name: 'endsAt',
          type: 'date',
          admin: {
            width: '50%',
            description: 'Optional end date/time. Leave empty for no expiration.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'affiliatePartner',
          type: 'relationship',
          relationTo: 'affiliates',
          admin: {
            width: '50%',
            description: 'Optional affiliate partner to assign to matching transactions.',
          },
        },
        {
          name: 'affiliateLifetime',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '50%',
            description:
              'If enabled, assign the affiliate to the user as lifetime referral for first-time customers only.',
          },
        },
      ],
    },
    {
      name: 'info',
      type: 'textarea',
      admin: {
        description: 'Optional internal notes about the promotion or partner agreement.',
      },
    },
  ],
  timestamps: true,
}

export default DiscountCodes
