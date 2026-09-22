import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { roleNames } from '~/lib/api/normalize'
import { adminApi, adminTokens } from '../api/client'
import { adminKeys } from '../api/keys'
import type { AdminIdentity, AuthTokens, GlobalUser } from '../api/types'

const readToken = () => adminTokens.read()?.accessToken ?? null

const normalizeUser = (user: GlobalUser): GlobalUser => ({
  ...user,
  roles: roleNames(user.roles),
})

/** Re-renders the guard the moment a token is written or cleared. */
export function useAdminToken(): string | null {
  return useSyncExternalStore(adminTokens.subscribe, readToken, () => null)
}

export function useAdminIdentity(enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.identity(),
    queryFn: async ({ signal }) => {
      const identity = await adminApi.get<AdminIdentity>('/admin/me', undefined, { signal })
      return { ...identity, user: normalizeUser(identity.user) }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export type LoginInput = { email: string; password: string }

export function useAdminLogin() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const tokens = await adminApi.post<AuthTokens>('/auth/login', input)
      return { ...tokens, user: normalizeUser(tokens.user) }
    },
    onSuccess: (tokens) => {
      adminTokens.write({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
      void client.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

export function useAdminLogout() {
  const client = useQueryClient()
  return useMutation({
    // Revokes every token this user holds, not only the current one.
    mutationFn: () => adminApi.post<null>('/auth/logout'),
    // The local session is dropped either way: a failed call must not strand
    // the user in a portal they believe they have left.
    onSettled: () => {
      adminTokens.write(null)
      client.removeQueries({ queryKey: adminKeys.all })
    },
  })
}
