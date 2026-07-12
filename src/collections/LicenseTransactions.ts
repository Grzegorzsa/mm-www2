import type { CollectionConfig } from 'payload'

export const LicenseTransactions: CollectionConfig = {
  slug: 'license-transactions',
  admin: {
    useAsTitle: 'transactionType',
    defaultColumns: ['transactionType', 'status', 'user', 'order', 'product', 'createdAt'],
    description: 'Immutable audit log for purchase, renewal, and upgrade license operations.',
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
          name: 'externalOrderTimestamp',
          type: 'date',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
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
          name: 'transactionType',
          type: 'select',
          required: true,
          options: [
            { label: 'New Purchase', value: 'new_purchase' },
            { label: 'Upgrade', value: 'upgrade' },
            { label: 'Crossgrade', value: 'crossgrade' },
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
          name: 'fromLicense',
          type: 'relationship',
          relationTo: 'licenses',
          admin: { width: '50%' },
        },
        {
          name: 'toLicense',
          type: 'relationship',
          relationTo: 'licenses',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fromVariant',
          type: 'relationship',
          relationTo: 'product-variants',
          admin: { width: '50%' },
        },
        {
          name: 'toVariant',
          type: 'relationship',
          relationTo: 'product-variants',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'amountPaidInCents',
          type: 'number',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Completed', value: 'completed' },
            { label: 'Failed', value: 'failed' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'discountCode',
          type: 'relationship',
          relationTo: 'discount-codes',
          admin: { width: '50%' },
        },
        {
          name: 'discountAmountCents',
          type: 'number',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'discountBaseAmountCents',
          type: 'number',
          admin: { width: '50%' },
        },
        {
          name: 'discountCodeValue',
          type: 'text',
          admin: { width: '50%', description: 'Normalized discount code used at checkout.' },
        },
      ],
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
    {
      name: 'info',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
