import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Installations: CollectionConfig = {
  slug: 'installations',
  admin: {
    useAsTitle: 'machineId',
    defaultColumns: ['user', 'product', 'machineId', 'computerName', 'os', 'disabled'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'admin-users') return true
      return { user: { equals: user.id } }
    },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          index: true,
          admin: { width: '25%' },
        },
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          admin: { width: '25%' },
        },
        {
          name: 'machineId',
          type: 'text',
          required: true,
          admin: { width: '25%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'computerName',
          type: 'text',
          admin: { width: '25%' },
        },
        {
          name: 'os',
          type: 'text',
          admin: { width: '25%' },
        },
        {
          name: 'token',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'certificate',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Base64-encoded XML certificate',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'disabled',
          label: 'Disabled',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '15%' },
        },
        {
          name: 'disabledAt',
          type: 'date',
          admin: {
            width: '15%',
            condition: (data) => Boolean(data?.disabled),
          },
        },
        {
          name: 'disabledReason',
          type: 'text',
          admin: {
            width: '70%',
            condition: (data) => Boolean(data?.disabled),
          },
        },
      ],
    },
  ],
  timestamps: true,
}
