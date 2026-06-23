import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { normalizeDomain } from '@/lib/bannedDomains'

const normalizeDomainField: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data

  const domainValue = data?.domain
  if (typeof domainValue === 'string') {
    data.domain = normalizeDomain(domainValue)
  }
  return data
}

export const BannedDomains: CollectionConfig = {
  slug: 'banned-domains',
  admin: {
    useAsTitle: 'domain',
    defaultColumns: ['domain', 'updatedAt'],
    description:
      'Disposable and temporary email domains blocked in registration and Lemon webhook.',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    create: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
    delete: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  hooks: {
    beforeValidate: [normalizeDomainField],
  },
  fields: [
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Domain only, for example: 10minutemail.com',
      },
    },
  ],
  timestamps: true,
}
