import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.collection === 'admin-users'
}
