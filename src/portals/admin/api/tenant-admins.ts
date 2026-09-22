import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './client'
import { adminKeys } from './keys'
import type { AdminRelationship, Tenant } from './types'

export type AttachAdminInput = {
  user_id: string
  relationship: AdminRelationship
  is_primary?: boolean
}

export function useAttachTenantAdmin(code: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: AttachAdminInput) =>
      adminApi.post<Tenant>(`/admin/tenants/${code}/admins`, input),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.tenant(code) }),
  })
}

export function useDetachTenantAdmin(code: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => adminApi.del<null>(`/admin/tenants/${code}/admins/${userId}`),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.tenant(code) }),
  })
}
