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
