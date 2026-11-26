import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './client'
import { adminKeys } from './keys'

/** The one academic year every school treats as "current", set by the platform admin. */
export type CurrentYear = {
  /** "2025/2026". */
  current: string
  /** Schools on the platform. */
  schools: number
  /** Schools whose own current year already matches `current`. */
  schoolsInSync: number
}

/** Two four-digit years, the second one year after the first. */
export const isValidYearCode = (code: string): boolean => {
  const match = /^(\d{4})\/(\d{4})$/.exec(code)
  return match !== null && Number(match[2]) === Number(match[1]) + 1
}

export function useCurrentYear(enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.currentYear(),
    queryFn: ({ signal }) => adminApi.get<CurrentYear>('/admin/academic-year/current', undefined, { signal }),
    enabled,
  })
}

/** Sets the current year for every school at once (global-admin / super-admin only). */
export function useSetCurrentYear() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => adminApi.post<CurrentYear>('/admin/academic-year/current', { code }),
    onSuccess: (data) => client.setQueryData(adminKeys.currentYear(), data),
  })
}
