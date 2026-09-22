/** Mirrors the permission column in the guide. Screens never inline a string. */
export const PERMISSION = {
  viewTenants: 'view-tenants',
  viewTenant: 'view-tenant',
  createTenant: 'create-tenant',
  updateTenant: 'update-tenant',
  provisionTenant: 'provision-tenant',
  changeTenantStatus: 'change-tenant-status',
  assignTenantAdmin: 'assign-tenant-admin',
  viewAuditLog: 'view-audit-log',
  viewGlobalUsers: 'view-global-users',
  createGlobalUser: 'create-global-user',
  updateGlobalUser: 'update-global-user',
  deleteGlobalUser: 'delete-global-user',
} as const

/** Deleting a tenant and writing roles are role-gated, not permission-gated. */
export const GLOBAL_ADMIN_ROLE = 'global-admin'

/** The only roles this portal may offer. Tenant role names never appear here. */
export const ASSIGNABLE_GLOBAL_ROLES = ['global-admin', 'admin-officer', 'reviewer'] as const
