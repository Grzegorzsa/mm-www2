import type { Payload } from 'payload'

export const TEMP_EMAIL_REJECT_MESSAGE = 'Temporary email addresses are not allowed'

export const DEFAULT_BANNED_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'yopmail.com',
  'dispostable.com',
  'getnada.com',
  'fakeinbox.com',
  'maildrop.cc',
  'mintemail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.info',
  'spam4.me',
  'trashmail.com',
  'trashmail.de',
  'trashmail.me',
  'trashmail.net',
  'trashmail.org',
  'emailondeck.com',
  'moakt.com',
  'mytemp.email',
  'tempr.email',
] as const

export function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^@+/, '')
}

export function parseBannedDomainsInput(value: string): string[] {
  const domains = value
    .split(/[,;\s]+/)
    .map((domain) => normalizeDomain(domain))
    .filter(Boolean)

  return Array.from(new Set(domains))
}

export function normalizeEmailAddress(value: string): string {
  const normalized = value.trim().toLowerCase()
  const atIndex = normalized.lastIndexOf('@')

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return normalized
  }

  const localPart = normalized.slice(0, atIndex).replace(/\./g, '')
  const domainPart = normalized.slice(atIndex + 1)

  return `${localPart}@${domainPart}`
}

export function parseBannedEmailsInput(value: string): string[] {
  const emails = value
    .split(/[,;\s]+/)
    .map((email) => normalizeEmailAddress(email))
    .filter(Boolean)

  return Array.from(new Set(emails))
}

export function getEmailDomain(email: string): string | null {
  const atIndex = email.lastIndexOf('@')
  if (atIndex <= 0 || atIndex === email.length - 1) return null

  const domain = normalizeDomain(email.slice(atIndex + 1))
  if (!domain.includes('.')) return null
  return domain
}

export async function isBannedDomain(payload: Payload, domain: string): Promise<boolean> {
  const normalized = normalizeDomain(domain)
  if (!normalized) return false

  const result = await payload.find({
    collection: 'banned-domains',
    where: { domain: { equals: normalized } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.totalDocs > 0
}

export async function isBannedEmailDomain(payload: Payload, email: string): Promise<boolean> {
  const domain = getEmailDomain(email)
  if (!domain) return false
  return isBannedDomain(payload, domain)
}

export async function isBannedEmailAddress(payload: Payload, email: string): Promise<boolean> {
  const normalized = normalizeEmailAddress(email)
  if (!normalized) return false

  const domain = getEmailDomain(normalized)

  // Keep compatibility with legacy records that may have been stored with dots
  // in the local part before normalization rules were introduced.
  if (domain) {
    const sameDomainResult = await payload.find({
      collection: 'banned-emails',
      where: { email: { contains: `@${domain}` } },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })

    const matched = sameDomainResult.docs.some((doc) => {
      const blockedEmail = typeof doc.email === 'string' ? doc.email : ''
      return normalizeEmailAddress(blockedEmail) === normalized
    })

    if (matched) return true
  }

  const result = await payload.find({
    collection: 'banned-emails',
    where: { email: { equals: normalized } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.totalDocs > 0
}
