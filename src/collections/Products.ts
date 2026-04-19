import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'uid', 'version', 'versionNo', 'releasedAt'],
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
          unique: true,
        },
        {
          name: 'uid',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'Unique identifier for the product (e.g. "mx-grid")',
          },
        },
        {
          name: 'version',
          type: 'text',
          required: true,
          minLength: 5,
          maxLength: 10,
        },
        {
          name: 'versionNo',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Numeric version used for license version range checks',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'releasedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'releaseUpdatedAt',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'thumb',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  timestamps: true,
}
