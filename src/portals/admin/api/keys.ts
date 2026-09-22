import type { QueryParams } from '~/lib/api/query'

/** Every admin cache entry hangs off one root, so logout can drop it wholesale. */
export const adminKeys = {
  all: ['admin'] as const,
  identity: () => [...adminKeys.all, 'identity'] as const,
  profile: () => [...adminKeys.all, 'profile'] as const,
  tenants: () => [...adminKeys.all, 'tenants'] as const,
  tenantList: (params: QueryParams) => [...adminKeys.tenants(), 'list', params] as const,
  tenant: (code: string) => [...adminKeys.tenants(), 'detail', code] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  userList: (params: QueryParams) => [...adminKeys.users(), 'list', params] as const,
  roles: () => [...adminKeys.all, 'roles'] as const,
  auditLogs: (params: QueryParams) => [...adminKeys.all, 'audit-logs', params] as const,
}
