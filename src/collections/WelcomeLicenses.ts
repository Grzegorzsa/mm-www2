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
      type: 'row',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'productExtensions',
          type: 'relationship',
          relationTo: 'product-extensions',
          hasMany: true,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'versionFrom',
          type: 'number',
          required: true,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'versionTo',
          type: 'number',
          required: true,
          admin: {
            width: '25%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'info',
          type: 'textarea',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'maxInstallations',
          type: 'number',
          required: true,
          defaultValue: 2,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'daysValid',
          type: 'number',
          admin: {
            description: 'Number of days the license is valid. Leave empty for unlimited.',
            width: '25%',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
