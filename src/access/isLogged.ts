import type { Access } from 'payload'

export const isLogged: Access = ({ req: { user } }) => {
  return Boolean(user)
}
