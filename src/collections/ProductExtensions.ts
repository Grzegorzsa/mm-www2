import type { CollectionConfig } from 'payload'

export const ProductExtensions: CollectionConfig = {
  slug: 'product-extensions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'uid', 'product'],
  },
  access: {
    read: () => true,
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
          admin: {
            width: '50%',
          },
        },
        {
          name: 'uid',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'Unique identifier (e.g. "essentials", "pro", "trial")',
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'description',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
