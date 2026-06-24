import { APIError } from 'payload'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'
import { normalizeDomain, parseBannedDomainsInput } from '@/lib/bannedDomains'

type BulkImportContext = {
  bannedDomainsBulk?: string[]
  skipBannedDomainsBulkImport?: boolean
}

const normalizeDomainField: CollectionBeforeValidateHook = async ({ data, context, req }) => {
  if (!data) return data

  const domainValue = data?.domain
  if (typeof domainValue === 'string') {
    const hookContext = context as BulkImportContext

    if (hookContext.skipBannedDomainsBulkImport) {
      data.domain = normalizeDomain(domainValue)
      return data
    }

    const importedDomains = parseBannedDomainsInput(domainValue)
    if (importedDomains.length === 0) {
      data.domain = normalizeDomain(domainValue)
      return data
    }

    let selectedDomain: string | null = null

    if (importedDomains.length > 1) {
      for (const candidateDomain of importedDomains) {
        const existing = await req.payload.find({
          collection: 'banned-domains',
          where: { domain: { equals: candidateDomain } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
          req,
        })

        if (existing.totalDocs === 0) {
          selectedDomain = candidateDomain
          break
        }
      }

      if (!selectedDomain) {
        throw new APIError('All provided banned domains already exist', 409)
      }

      hookContext.bannedDomainsBulk = importedDomains.filter(
        (candidateDomain) => candidateDomain !== selectedDomain,
      )
    } else {
      selectedDomain = importedDomains[0] ?? null
      hookContext.bannedDomainsBulk = undefined
    }

    if (!selectedDomain) {
      throw new APIError('All provided banned domains already exist', 409)
    }

    data.domain = selectedDomain
  }
  return data
}

const createBulkImportedDomains: CollectionAfterChangeHook = async ({
  doc,
  operation,
  context,
  req,
}) => {
  if (operation !== 'create') return doc

  const hookContext = context as BulkImportContext
  const bulkDomains = hookContext.bannedDomainsBulk ?? []
  if (bulkDomains.length === 0) return doc

  for (const domain of bulkDomains) {
    const existing = await req.payload.find({
      collection: 'banned-domains',
      where: { domain: { equals: domain } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (existing.totalDocs > 0) {
      continue
    }

    try {
      await req.payload.create({
        collection: 'banned-domains',
        data: { domain },
        req,
        overrideAccess: false,
        context: { skipBannedDomainsBulkImport: true },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      if (message.includes('duplicate') || message.includes('unique')) {
        continue
      }

      throw error
    }
  }

  return doc
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
    afterChange: [createBulkImportedDomains],
  },
  fields: [
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Domain only, for example: 10minutemail.com. You can also paste multiple domains separated by commas, semicolons, spaces, or new lines.',
      },
    },
  ],
  timestamps: true,
}
