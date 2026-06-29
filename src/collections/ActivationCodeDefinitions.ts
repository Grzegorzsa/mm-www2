import type { CollectionConfig } from 'payload'

export const ActivationCodeDefinitions: CollectionConfig = {
  slug: 'activation-code-definitions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'product',
      'productVariant',
      'trial',
      'versionFrom',
      'versionTo',
      'maxInstallations',
      'validDays',
      'seller',
    ],
    description:
      'Reusable activation code definitions. Separate static configuration from generated one-time code instances.',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    create: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
    delete: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Internal definition label used in admin and reports.',
      },
    },
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
    {
      name: 'trial',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        width: '25%',
        description:
          'Marks this definition as trial. User can redeem only one trial per product + variant.',
      },
    },
    {
      name: 'maxInstallations',
      type: 'number',
      required: true,
      defaultValue: 2,
      min: 1,
      admin: { width: '25%' },
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
      name: 'seller',
      type: 'relationship',
      relationTo: 'affiliates',
      admin: {
        width: '25%',
        description: 'Optional seller/affiliate attached to this definition.',
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
    {
      name: 'info',
      type: 'textarea',
      admin: {
        description: 'Optional internal note for this definition.',
      },
    },
  ],
  timestamps: true,
}

export default ActivationCodeDefinitions
