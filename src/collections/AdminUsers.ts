import type { CollectionConfig } from 'payload'

export const AdminUsers: CollectionConfig = {
  slug: 'admin-users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    create: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
    delete: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
