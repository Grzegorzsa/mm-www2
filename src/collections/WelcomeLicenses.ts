import type { CollectionConfig } from 'payload'

export const WelcomeLicenses: CollectionConfig = {
  slug: 'welcome-licenses',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['product', 'versionFrom', 'versionTo', 'maxInstallations', 'daysValid'],
    description: 'Licenses that are automatically assigned to new users upon registration',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    create: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
    delete: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'productExtensions',
      type: 'relationship',
      relationTo: 'product-extensions',
      hasMany: true,
    },
    {
      name: 'versionFrom',
      type: 'number',
      required: true,
    },
    {
      name: 'versionTo',
      type: 'number',
      required: true,
    },
    {
      name: 'info',
      type: 'textarea',
    },
    {
      name: 'maxInstallations',
      type: 'number',
      required: true,
      defaultValue: 2,
    },
    {
      name: 'daysValid',
      type: 'number',
      admin: {
        description: 'Number of days the license is valid. Leave empty for unlimited.',
      },
    },
  ],
  timestamps: true,
}
