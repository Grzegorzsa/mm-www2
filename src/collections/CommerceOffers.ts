import type { CollectionConfig } from 'payload'

export const CommerceOffers: CollectionConfig = {
  slug: 'commerce-offers',
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== 'object') return data

        const mutableData = data as Record<string, unknown>
        const rawValue = mutableData.lemonSqueezyVariantId

        if (typeof rawValue === 'string' && rawValue.trim() === '') {
          mutableData.lemonSqueezyVariantId = null
        }

        return mutableData
      },
    ],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'lemonSqueezyVariantId',
      'actionType',
      'product',
      'targetVariant',
      'active',
    ],
    description:
      'Policy rules for Lemon Squeezy variants. Use this to control new purchases, upgrades, and renewals.',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    create: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
    delete: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lemonSqueezyVariantId',
          type: 'text',
          required: false,
          unique: true,
          validate: (value: unknown, { siblingData }: { siblingData?: unknown }) => {
            const actionType =
              typeof siblingData === 'object' && siblingData
                ? (siblingData as { actionType?: string }).actionType
                : undefined

            if (actionType !== 'upgrade_replace' && !value) {
              return 'Lemon Squeezy variant_id is required for New Purchase and Renewal offers.'
            }

            return true
          },
          admin: {
            width: '50%',
            description:
              'Lemon Squeezy variant_id that triggers this offer rule. Optional for Upgrade (Replace).',
          },
        },
        {
          name: 'actionType',
          type: 'select',
          required: true,
          defaultValue: 'new_purchase',
          options: [
            { label: 'New Purchase', value: 'new_purchase' },
            { label: 'Upgrade (Replace)', value: 'upgrade_replace' },
            { label: 'Renewal', value: 'renewal' },
          ],
          admin: { width: '50%' },
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
          admin: { width: '50%' },
        },
        {
          name: 'targetVariant',
          type: 'relationship',
          relationTo: 'product-variants',
          required: true,
          admin: {
            width: '50%',
            description: 'Variant entitlement created by this purchase/upgrade.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'versionFrom',
          type: 'number',
          required: true,
          defaultValue: 1,
          admin: { width: '50%' },
        },
        {
          name: 'versionTo',
          type: 'number',
          required: true,
          defaultValue: 1,
          admin: {
            width: '50%',
            description: 'Set explicit upper major version.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'allowedFromVariants',
          type: 'relationship',
          relationTo: 'product-variants',
          hasMany: true,
          admin: {
            width: '50%',
            description:
              'Optional whitelist for upgrade source variants. Used only with Upgrade (Replace).',
          },
        },
        {
          name: 'denyFromVariants',
          type: 'relationship',
          relationTo: 'product-variants',
          hasMany: true,
          admin: {
            width: '50%',
            description:
              'Optional blacklist for upgrade source variants. Useful to block Elements discount paths.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isCommercial',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '50%',
            description:
              'Mark commercial variants (Loops/Beats/Composer) for reporting and filtering.',
          },
        },
        {
          name: 'referencePriceCents',
          type: 'number',
          admin: {
            width: '50%',
            description: 'Optional reference list price in cents (for reporting only).',
          },
        },
      ],
    },
    {
      name: 'info',
      type: 'textarea',
      admin: {
        description: 'Optional notes describing business intent for this rule.',
      },
    },
  ],
  timestamps: true,
}
