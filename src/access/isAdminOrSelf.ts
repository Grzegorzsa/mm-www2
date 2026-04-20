import type { Access } from 'payload'

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'admin-users') return true
  return { id: { equals: user.id } }
}
