import type { Access, CollectionConfig } from 'payload'

const adminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'admin-users') return true
  return { user: { equals: user.id } }
}

const adminOnly: Access = ({ req: { user } }) => {
  return user?.collection === 'admin-users'
}

export const Licenses: CollectionConfig = {
  slug: 'licenses',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'product', 'active', 'validTill', 'versionFrom', 'versionTo'],
  },
  access: {
    read: adminOrOwner,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
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
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          index: true,
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
          name: 'validTill',
          type: 'date',
          admin: {
            description: 'Leave empty for unlimited validity',
            width: '25%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'deactivatedReason',
          type: 'text',
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
            width: '75%',
          },
        },
        {
          name: 'maxInstallations',
          type: 'number',
          defaultValue: 2,
          admin: {
            width: '25%',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
