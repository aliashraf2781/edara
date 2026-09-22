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
  reference: (code: string) => [...adminKeys.all, 'reference', code] as const,
  insights: () => [...adminKeys.all, 'insights'] as const,
  schoolInsights: (termId: string) => [...adminKeys.insights(), 'schools', termId] as const,
  schoolStats: (code: string, termId: string) =>
    [...adminKeys.insights(), 'stats', code, termId] as const,
  schoolStudents: (code: string, params: QueryParams) =>
    [...adminKeys.insights(), 'students', code, params] as const,
  schoolStudent: (code: string, id: string) =>
    [...adminKeys.insights(), 'student', code, id] as const,
  schoolResults: (code: string, params: QueryParams) =>
    [...adminKeys.insights(), 'results', code, params] as const,
}
