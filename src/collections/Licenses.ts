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
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'productExtensions',
      type: 'relationship',
      relationTo: 'product-extensions',
      hasMany: true,
    },
    {
      name: 'validTill',
      type: 'date',
      admin: {
        description: 'Leave empty for unlimited validity',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'deactivatedReason',
      type: 'text',
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
      defaultValue: 2,
    },
  ],
  timestamps: true,
}
