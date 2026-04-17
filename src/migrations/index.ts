import * as migration_20260407_115014 from './20260407_115014'
import * as migration_20260417_rename_users_to_admin_users from './20260417_rename_users_to_admin_users'

export const migrations = [
  {
    up: migration_20260407_115014.up,
    down: migration_20260407_115014.down,
    name: '20260407_115014',
  },
  {
    up: migration_20260417_rename_users_to_admin_users.up,
    down: migration_20260417_rename_users_to_admin_users.down,
    name: '20260417_rename_users_to_admin_users',
  },
]
