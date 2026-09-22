import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './client'
import { adminKeys } from './keys'
import type { GlobalUser } from './types'

export function useProfile() {
  return useQuery({
    queryKey: adminKeys.profile(),
    queryFn: ({ signal }) => adminApi.get<GlobalUser>('/auth/profile', undefined, { signal }),
  })
}

export type ProfileUpdate = {
  name?: string
  phone?: string
  locale?: 'en' | 'ar'
  timezone?: string
}

export function useUpdateProfile() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (update: ProfileUpdate) => adminApi.post<GlobalUser>('/auth/profile', update),
    onSuccess: (user) => {
      client.setQueryData(adminKeys.profile(), user)
      void client.invalidateQueries({ queryKey: adminKeys.identity() })
    },
  })
}

export type PasswordChange = {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: PasswordChange) => adminApi.post<null>('/auth/profile/password', input),
  })
}

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']

export function useAvatar() {
  const client = useQueryClient()
  const refresh = () => {
    void client.invalidateQueries({ queryKey: adminKeys.profile() })
    void client.invalidateQueries({ queryKey: adminKeys.identity() })
  }

  const upload = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('avatar', file)
      // Replaces any existing avatar; there is no separate "update" call.
      return adminApi.upload<GlobalUser>('/auth/profile/avatar', form)
    },
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: () => adminApi.del<null>('/auth/profile/avatar'),
    onSuccess: refresh,
  })

  return { upload, remove }
}
