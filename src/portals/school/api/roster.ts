import { useQuery } from '@tanstack/react-query'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { Roster } from './types'

/** The enrolled students of one grade plus its subject columns, in printed order. */
export function useRoster(gradeId: string) {
  return useQuery({
    queryKey: schoolKeys.roster(gradeId),
    queryFn: ({ signal }) =>
      schoolApi.get<Roster>('/school/roster', { grade_id: gradeId }, { signal }),
    enabled: gradeId !== '',
    staleTime: 5 * 60 * 1000,
  })
}
