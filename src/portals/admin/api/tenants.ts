import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import type { QueryParams } from '~/lib/api/query'
import { adminApi } from './client'
import { adminKeys } from './keys'
import type { ProvisionResult, Tenant, TenantCreateResult, TenantSummary } from './types'

export type TenantListParams = {
  page: number
  perPage: number
  search: string
  status: string
  provisioningStatus: string
}

const toQuery = (params: TenantListParams): QueryParams => ({
  page: params.page,
  per_page: params.perPage,
  search: params.search,
  sort: 'code',
  filter: { status: params.status, provisioning_status: params.provisioningStatus },
})

export function useTenantList(params: TenantListParams, enabled: boolean) {
  const query = toQuery(params)
  return useQuery({
    queryKey: adminKeys.tenantList(query),
    queryFn: async ({ signal }) =>
      normalizePage<TenantSummary>(
        await adminApi.get('/admin/tenants', query, { signal }),
        params.perPage,
      ),
    enabled,
    // The previous page stays on screen while the next one loads, so the
    // table never collapses to a skeleton mid-pagination.
    placeholderData: (previous) => previous,
  })
}

export function useTenant(code: string, enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.tenant(code),
    queryFn: ({ signal }) => adminApi.get<Tenant>(`/admin/tenants/${code}`, undefined, { signal }),
    enabled,
  })
}

/**
 * Creation is a single request that creates the record and activates it.
 * `code` is server-generated (e.g. `SCH-IR4QGT`) and never sent;
 * contact_phone/governorate/address are not accepted here either — they
 * are set afterward via `useUpdateTenant`. There is no per-school database.
 */
export type TenantDraft = {
  name: string
  admin_email: string
  admin_password: string
}

export function useCreateTenant() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (draft: TenantDraft) => adminApi.post<TenantCreateResult>('/admin/tenants', draft),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.tenants() }),
  })
}

export type TenantUpdate = {
  name?: string
  contact_email?: string
  contact_phone?: string
  governorate?: string
  address?: string
}

export function useUpdateTenant(code: string) {
  const client = useQueryClient()
  return useMutation({
    // `code` is immutable and rejected if sent.
    mutationFn: (update: TenantUpdate) => adminApi.post<Tenant>(`/admin/tenants/${code}`, update),
    onSuccess: (tenant) => {
      client.setQueryData(adminKeys.tenant(code), tenant)
      void client.invalidateQueries({ queryKey: adminKeys.tenants() })
    },
  })
}

export function useProvisionTenant(code: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => adminApi.post<ProvisionResult>(`/admin/tenants/${code}/provision`),
    onSuccess: (result) => {
      client.setQueryData(adminKeys.tenant(code), result.tenant)
      void client.invalidateQueries({ queryKey: adminKeys.tenants() })
    },
  })
}

export function useTenantStatusChange(code: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (action: 'activate' | 'deactivate') =>
      adminApi.post<Tenant>(`/admin/tenants/${code}/${action}`),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.tenants() }),
  })
}

export function useDeleteTenant() {
  const client = useQueryClient()
  return useMutation({
    // Soft-deletes the registry record only.
    mutationFn: (code: string) => adminApi.del<null>(`/admin/tenants/${code}`),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.tenants() }),
  })
}
