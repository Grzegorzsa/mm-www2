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
          name: 'productVariants',
          type: 'relationship',
          relationTo: 'product-variants',
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
          name: 'trial',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '25%',
            description: 'Marks this license as a time-limited trial.',
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
    {
      type: 'row',
      fields: [
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
          admin: {
            description: 'Associated purchase order transaction',
            width: '50%',
          },
        },
        {
          name: 'upgradedFromLicense',
          type: 'relationship',
          relationTo: 'licenses',
          admin: {
            description: 'Source license used for upgrade transitions',
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'upgradeFromVariant',
          type: 'relationship',
          relationTo: 'product-variants',
          admin: {
            description: 'Source variant used for upgrade transitions',
            width: '50%',
          },
        },
        {
          name: 'preassignedPartner',
          type: 'relationship',
          relationTo: 'affiliates',
          admin: {
            description:
              'Affiliate partner who distributed this specific key (e.g., for Player variant)',
            width: '50%',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
