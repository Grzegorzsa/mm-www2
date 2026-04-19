import type { Access, CollectionConfig } from 'payload'

const adminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'admin-users') return true
  return { user: { equals: user.id } }
}

const adminOnly: Access = ({ req: { user } }) => {
  return user?.collection === 'admin-users'
}

export const Installations: CollectionConfig = {
  slug: 'installations',
  admin: {
    useAsTitle: 'machineId',
    defaultColumns: ['user', 'product', 'machineId', 'computerName', 'os', 'disabled'],
  },
  access: {
    read: adminOrOwner,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'machineId',
      type: 'text',
    },
    {
      name: 'token',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'certificate',
      type: 'textarea',
      admin: {
        description: 'Base64-encoded XML certificate',
      },
    },
    {
      name: 'computerName',
      type: 'text',
    },
    {
      name: 'os',
      type: 'text',
    },
    {
      name: 'disabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'disabledReason',
      type: 'text',
    },
    {
      name: 'disabledAt',
      type: 'date',
    },
  ],
  timestamps: true,
}
