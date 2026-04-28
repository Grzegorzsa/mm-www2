import type { Access } from 'payload'

/**
 * Use this when the collection has a *relationship field* pointing to the owning user.
 *
 * Example collections: Licenses (field: 'user'), Installations (field: 'user')
 *
 * Pass the name of the relationship field, e.g. isAdminOrOwner('user').
 *
 * The resulting query constraint is:  { [field]: { equals: user.id } }
 *
 * ---
 * Contrast with `isAdminOrSelf`:
 *   - `isAdminOrSelf`   → use when the document itself IS the user (i.e. the Users collection).
 *                         Filters by the document's own id: { id: { equals: user.id } }
 *   - `isAdminOrOwner`  → use when the document BELONGS TO a user via a relationship field.
 *                         Filters by that field:            { [field]: { equals: user.id } }
 */
export const isAdminOrOwner =
  (field: string): Access =>
  ({ req: { user } }) => {
    if (!user) return false
    if (user.collection === 'admin-users') return true
    return { [field]: { equals: user.id } }
  }
