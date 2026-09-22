import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage, roleNames } from '~/lib/api/normalize'
import type { QueryParams } from '~/lib/api/query'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { SchoolUser, SchoolUserStatus } from './types'

export type StaffListParams = { page: number; perPage: number; search: string }

const toQuery = (params: StaffListParams): QueryParams => ({
  page: params.page,
  per_page: params.perPage,
  search: params.search,
})

const normalizeUser = (user: SchoolUser): SchoolUser => ({
  ...user,
  roles: roleNames(user.roles),
})

/** Every endpoint here is super-admin only; anyone else gets a 403. */
export function useStaffList(params: StaffListParams, enabled: boolean) {
  const query = toQuery(params)
  return useQuery({
    queryKey: schoolKeys.staffList(query),
    queryFn: async ({ signal }) => {
      const page = normalizePage<SchoolUser>(
        await schoolApi.get('/school/users', query, { signal }),
        params.perPage,
      )
      return { ...page, data: page.data.map(normalizeUser) }
    },
    enabled,
    placeholderData: (previous) => previous,
  })
}

/**
 * Just the three fields the endpoint accepts. Phone/employee code/national ID
 * and roles are no longer accepted at creation — the account starts with
 * `roles: []` and everything else is set afterward via update/sync-roles.
 */
export type StaffCreate = {
  name: string
  email: string
  password: string
}

export function useCreateStaff() {
  const client = useQueryClient()
  return useMutation({
    // Created active immediately — there is no email verification step here.
    mutationFn: async (input: StaffCreate) =>
      normalizeUser(await schoolApi.post<SchoolUser>('/school/users', input)),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.staff() }),
  })
}

export type StaffUpdate = {
  id: string
  name?: string
  phone?: string
  employee_code?: string
  national_id?: string
  password?: string
  status?: SchoolUserStatus
}

export function useUpdateStaff() {
  const client = useQueryClient()
  return useMutation({
    // Email is not editable on this endpoint, so it is never sent.
    mutationFn: async ({ id, ...body }: StaffUpdate) =>
      normalizeUser(await schoolApi.put<SchoolUser>(`/school/users/${id}`, body)),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.staff() }),
  })
}

export function useSyncStaffRoles() {
  const client = useQueryClient()
  return useMutation({
    // Replaces the role set rather than merging into it.
    mutationFn: async ({ id, roles }: { id: string; roles: string[] }) =>
      normalizeUser(await schoolApi.post<SchoolUser>(`/school/users/${id}/roles`, { roles })),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.staff() }),
  })
}

export function useDeleteStaff() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schoolApi.del<null>(`/school/users/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.staff() }),
  })
}
