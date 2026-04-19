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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'uid',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier (e.g. "essentials", "pro", "trial")',
      },
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
    },
  ],
  timestamps: true,
}
