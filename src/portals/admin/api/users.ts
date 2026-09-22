import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage, roleNames } from '~/lib/api/normalize'
import type { QueryParams } from '~/lib/api/query'
import { adminApi } from './client'
import { adminKeys } from './keys'
import type { GlobalUser, Role, UserStatus } from './types'

export type UserListParams = { page: number; perPage: number; search: string }

const toQuery = (params: UserListParams): QueryParams => ({
  page: params.page,
  per_page: params.perPage,
  search: params.search,
})

const normalizeUser = (user: GlobalUser): GlobalUser => ({
  ...user,
  roles: roleNames(user.roles),
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
      const page = normalizePage<GlobalUser>(
        await adminApi.get('/users', query, { signal }),
        params.perPage,
      )
      return { ...page, data: page.data.map(normalizeUser) }
    },
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useGlobalRoles(enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.roles(),
    queryFn: ({ signal }) => adminApi.get<Role[]>('/roles', undefined, { signal }),
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

export type UpdateUserInput = { id: string; name?: string; roles?: string[] }

export function useUpdateGlobalUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateUserInput) =>
      normalizeUser(await adminApi.post<GlobalUser>(`/users/${id}`, body)),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.users() }),
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
