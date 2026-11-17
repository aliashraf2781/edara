import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roleNames } from '~/lib/api/normalize'
import type { QueryParams } from '~/lib/api/query'
import { adminApi } from './client'
import { adminKeys } from './keys'
import type { GlobalUser, Role, UserStatus } from './types'

export const USER_STATUSES: readonly UserStatus[] = [
  'pending',
  'active',
  'suspended',
  'rejected',
  'banned',
]

export const USER_SORTS = ['-created_at', 'created_at', 'name', '-name', 'id', '-id'] as const
export type UserSort = (typeof USER_SORTS)[number]
export const isUserSort = (value: string): value is UserSort =>
  (USER_SORTS as readonly string[]).includes(value)

export type UserListParams = {
  page: number
  perPage: number
  search: string
  status: string
  role: string
  email: string
  sort: string
}

const toQuery = (params: UserListParams): QueryParams => ({
  page: params.page,
  per_page: params.perPage,
  search: params.search.trim(),
  // Only sorts the guide lists are sent; anything else (a hand-edited URL)
  // falls back to the server default instead of causing a 422.
  sort: isUserSort(params.sort) ? params.sort : undefined,
  filter: { status: params.status, email: params.email.trim(), 'roles.name': params.role },
})

const normalizeUser = (user: GlobalUser): GlobalUser => ({
  ...user,
  roles: roleNames(user.roles),
})

/** Spatie may serialise permissions as models too; the UI wants names. */
const normalizeRole = (role: Role): Role => ({
  ...role,
  permissions: roleNames(role.permissions),
})

/**
 * Global users and roles live at /users and /roles, not under /admin — a
 * deliberate split in the API, not an oversight.
 */
export function useGlobalUserList(params: UserListParams, enabled: boolean) {
  const query = toQuery(params)
  return useQuery({
    queryKey: adminKeys.userList(query),
    queryFn: async ({ signal }) => {
      const page = await adminApi.getPage<GlobalUser>('/users', query, { signal }, params.perPage)
      return { ...page, data: page.data.map(normalizeUser) }
    },
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useGlobalRoles(enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.roles(),
    queryFn: async ({ signal }) => {
      const roles = await adminApi.get<Role[] | null>('/roles', undefined, { signal })
      return (roles ?? []).map(normalizeRole)
    },
    enabled,
    // Roles and their permissions change rarely; refetching per screen is waste.
    staleTime: 10 * 60 * 1000,
  })
}

export type CreateUserInput = {
  name: string
  email: string
  password: string
  password_confirmation: string
  roles?: string[]
}

export function useCreateGlobalUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateUserInput) =>
      normalizeUser(await adminApi.post<GlobalUser>('/users', input)),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.users() }),
  })
}

/** Send only what changed. `roles`, when present, REPLACES the whole set. */
export type UpdateUserInput = {
  id: string
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
  roles?: string[]
}

export function useUpdateGlobalUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateUserInput) =>
      normalizeUser(await adminApi.post<GlobalUser>(`/users/${id}`, body)),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: adminKeys.users() })
      // Editing yourself can change your own permissions or name.
      void client.invalidateQueries({ queryKey: adminKeys.identity() })
    },
  })
}

export function useGlobalUserStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UserStatus }) =>
      normalizeUser(await adminApi.post<GlobalUser>(`/users/${id}/status`, { status })),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.users() }),
  })
}

export function useDeleteGlobalUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.del<null>(`/users/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.users() }),
  })
}

/* ----------------------------------------------------------------- roles */

export type RoleInput = { name: string; permissions: string[] }

/** A role change alters user chips and possibly the caller's own permissions. */
const refreshAfterRoleChange = (client: ReturnType<typeof useQueryClient>) => {
  void client.invalidateQueries({ queryKey: adminKeys.roles() })
  void client.invalidateQueries({ queryKey: adminKeys.users() })
  void client.invalidateQueries({ queryKey: adminKeys.identity() })
}

export function useCreateRole() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: RoleInput) => normalizeRole(await adminApi.post<Role>('/roles', input)),
    onSuccess: () => refreshAfterRoleChange(client),
  })
}

/** `permissions` replaces the role's permission set (sync). */
export function useUpdateRole() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: RoleInput & { id: number }) =>
      normalizeRole(await adminApi.post<Role>(`/roles/${id}`, body)),
    onSuccess: () => refreshAfterRoleChange(client),
  })
}

export function useDeleteRole() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.del<null>(`/roles/${id}`),
    onSuccess: () => refreshAfterRoleChange(client),
  })
}
