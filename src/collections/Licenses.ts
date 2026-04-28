import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrOwner } from '@/access/isAdminOrOwner'

async function resolveUserEmail(userValue: unknown, req: any): Promise<string | undefined> {
  if (!userValue) return undefined

  if (typeof userValue === 'object' && userValue !== null && 'email' in userValue) {
    const email = (userValue as { email?: unknown }).email
    return typeof email === 'string' ? email : undefined
  }

  if (typeof userValue !== 'string' && typeof userValue !== 'number') {
    return undefined
  }

  try {
    const user = (await req.payload.findByID({
      collection: 'users',
      id: userValue,
      depth: 0,
      req,
    })) as { email?: unknown }

    return typeof user?.email === 'string' ? user.email : undefined
  } catch {
    return undefined
  }
}

export const Licenses: CollectionConfig = {
  slug: 'licenses',
  admin: {
    useAsTitle: 'userEmail',
    listSearchableFields: ['userEmail'],
    defaultColumns: ['user', 'product', 'active', 'validTill', 'versionFrom', 'versionTo'],
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        const userEmail = await resolveUserEmail(data?.user ?? originalDoc?.user, req)
        if (userEmail) {
          data.userEmail = userEmail
        }

        return data
      },
    ],
  },
  access: {
    read: isAdminOrOwner('user'), // user can read own licenses (matched by `user` field), admin can read all
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
          name: 'userEmail',
          type: 'text',
          index: true,
          admin: {
            hidden: true,
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
