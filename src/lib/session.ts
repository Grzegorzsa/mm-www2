import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'

export async function getSessionUser(): Promise<User | null> {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await headers() })
    if (!user || (user as { collection?: string }).collection !== 'users') return null
    return user as User
  } catch {
    return null
  }
}
