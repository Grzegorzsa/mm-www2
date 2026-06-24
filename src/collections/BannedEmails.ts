import { APIError } from 'payload'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'
import { normalizeEmailAddress, parseBannedEmailsInput } from '@/lib/bannedDomains'

type BulkImportContext = {
  bannedEmailsBulk?: string[]
  skipBannedEmailsBulkImport?: boolean
}

const normalizeEmailField: CollectionBeforeValidateHook = async ({ data, context, req }) => {
  if (!data) return data

  const emailValue = data?.email
  if (typeof emailValue === 'string') {
    const hookContext = context as BulkImportContext

    if (hookContext.skipBannedEmailsBulkImport) {
      data.email = normalizeEmailAddress(emailValue)
      return data
    }

    const importedEmails = parseBannedEmailsInput(emailValue)
    if (importedEmails.length === 0) {
      data.email = normalizeEmailAddress(emailValue)
      return data
    }

    let selectedEmail: string | null = null

    if (importedEmails.length > 1) {
      for (const candidateEmail of importedEmails) {
        const existing = await req.payload.find({
          collection: 'banned-emails',
          where: { email: { equals: candidateEmail } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
          req,
        })

        if (existing.totalDocs === 0) {
          selectedEmail = candidateEmail
          break
        }
      }

      if (!selectedEmail) {
        throw new APIError('All provided banned emails already exist', 409)
      }

      hookContext.bannedEmailsBulk = importedEmails.filter(
        (candidateEmail) => candidateEmail !== selectedEmail,
      )
    } else {
      selectedEmail = importedEmails[0] ?? null
      hookContext.bannedEmailsBulk = undefined
    }

    if (!selectedEmail) {
      throw new APIError('All provided banned emails already exist', 409)
    }

    data.email = selectedEmail
  }

  return data
}

const createBulkImportedEmails: CollectionAfterChangeHook = async ({ operation, context, req }) => {
  if (operation !== 'create') return

  const hookContext = context as BulkImportContext
  const bulkEmails = hookContext.bannedEmailsBulk ?? []
  if (bulkEmails.length === 0) return

  for (const email of bulkEmails) {
    const existing = await req.payload.find({
      collection: 'banned-emails',
      where: { email: { equals: email } },
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
        collection: 'banned-emails',
        data: { email },
        req,
        overrideAccess: false,
        context: { skipBannedEmailsBulkImport: true },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      if (message.includes('duplicate') || message.includes('unique')) {
        continue
      }

      throw error
    }
  }
}

export const BannedEmails: CollectionConfig = {
  slug: 'banned-emails',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'updatedAt'],
    description:
      'Specific email addresses blocked from registration and checkout, even when the domain is allowed.',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    create: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
    delete: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  hooks: {
    beforeValidate: [normalizeEmailField],
    afterChange: [createBulkImportedEmails],
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Email address only, for example: spam@example.com. You can also paste multiple emails separated by commas, semicolons, spaces, or new lines.',
      },
    },
  ],
  timestamps: true,
}
