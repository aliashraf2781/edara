/** Mirrors the permission table in the guide. Screens never inline a string. */
export const PERMISSION = {
  viewTenants: 'view-tenants',
  viewTenant: 'view-tenant',
  createTenant: 'create-tenant',
  updateTenant: 'update-tenant',
  changeTenantStatus: 'change-tenant-status',
  deleteTenant: 'delete-tenant',
  provisionTenant: 'provision-tenant',
  purgeTenantDatabase: 'purge-tenant-database',
  assignTenantAdmin: 'assign-tenant-admin',
  viewGlobalUsers: 'view-global-users',
  createGlobalUser: 'create-global-user',
  updateGlobalUser: 'update-global-user',
  deleteGlobalUser: 'delete-global-user',
  assignGlobalRole: 'assign-global-role',
  viewAuditLog: 'view-audit-log',
} as const

export const SUPER_ADMIN_ROLE = 'super-admin'
export const GLOBAL_ADMIN_ROLE = 'global-admin'

/**
 * Built-in roles. The backend does not block editing or deleting them, so the
 * UI must: a mistake here can lock every operator out of the platform.
 */
export const BUILT_IN_ROLES: readonly string[] = [
  SUPER_ADMIN_ROLE,
  GLOBAL_ADMIN_ROLE,
  'admin-officer',
  'reviewer',
]

export const isBuiltInRole = (name: string) => BUILT_IN_ROLES.includes(name)

/**
 * There is no GET /permissions endpoint yet, so the matrix is hardcoded from
 * the guide. Permissions a role carries that are not listed here are still
 * shown and preserved by the editor (see `groupPermissions`).
 */
export type PermissionGroupId = 'schools' | 'users' | 'audit'

export const PERMISSION_GROUPS: readonly {
  id: PermissionGroupId
  permissions: readonly string[]
}[] = [
  {
    id: 'schools',
    permissions: [
      PERMISSION.viewTenants,
      PERMISSION.viewTenant,
      PERMISSION.createTenant,
      PERMISSION.updateTenant,
      PERMISSION.changeTenantStatus,
      PERMISSION.deleteTenant,
      PERMISSION.provisionTenant,
      PERMISSION.purgeTenantDatabase,
      PERMISSION.assignTenantAdmin,
    ],
  },
  {
    id: 'users',
    permissions: [
      PERMISSION.viewGlobalUsers,
      PERMISSION.createGlobalUser,
      PERMISSION.updateGlobalUser,
      PERMISSION.deleteGlobalUser,
      PERMISSION.assignGlobalRole,
    ],
  },
  { id: 'audit', permissions: [PERMISSION.viewAuditLog] },
]

export const KNOWN_PERMISSIONS: readonly string[] = PERMISSION_GROUPS.flatMap(
  (group) => group.permissions,
)

/** Permissions on a role that the hardcoded catalog does not know about. */
export const unknownPermissions = (granted: readonly string[]) =>
  granted.filter((permission) => !KNOWN_PERMISSIONS.includes(permission))

/**
 * Built-in roles that cannot be handed out from the UI. `super-admin` is the
 * legacy platform owner; it is only kept on a user who already has it.
 */
export const UNASSIGNABLE_ROLES: readonly string[] = [SUPER_ADMIN_ROLE]
