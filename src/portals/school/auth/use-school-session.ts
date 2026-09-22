import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { roleNames } from '~/lib/api/normalize'
import { schoolApi, schoolTokens } from '../api/client'
import { schoolKeys } from '../api/keys'
import type { SchoolIdentity, SchoolUser } from '../api/types'

const readToken = () => schoolTokens.read()?.accessToken ?? null

const normalizeUser = (user: SchoolUser): SchoolUser => ({
  ...user,
  roles: roleNames(user.roles),
})

const normalizeIdentity = (identity: SchoolIdentity): SchoolIdentity => ({
  ...identity,
  user: normalizeUser(identity.user),
})

export function useSchoolToken(): string | null {
  return useSyncExternalStore(schoolTokens.subscribe, readToken, () => null)
}

export function useSchoolIdentity(enabled: boolean) {
  return useQuery({
    queryKey: schoolKeys.identity(),
    queryFn: async ({ signal }) =>
      normalizeIdentity(await schoolApi.get<SchoolIdentity>('/school/me', undefined, { signal })),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export type SchoolLoginInput = { email: string; password: string }

type SchoolLoginResponse = { user: SchoolUser; accessToken: string; tokenType: string }

export function useSchoolLogin() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: SchoolLoginInput) => {
      const response = await schoolApi.post<SchoolLoginResponse>('/school/auth/login', input)
      return { ...response, user: normalizeUser(response.user) }
    },
    onSuccess: (response) => {
      // No refresh token is issued here, so none is stored.
      schoolTokens.write({ accessToken: response.accessToken, refreshToken: null })
      void client.invalidateQueries({ queryKey: schoolKeys.all })
    },
  })
}

export function useSchoolLogout() {
  const client = useQueryClient()
  return useMutation({
    // Revokes the current token only, unlike the global portal's logout.
    mutationFn: () => schoolApi.post<null>('/school/auth/logout'),
    onSettled: () => {
      schoolTokens.write(null)
      client.removeQueries({ queryKey: schoolKeys.all })
    },
  })
}
