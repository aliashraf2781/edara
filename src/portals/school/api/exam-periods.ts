import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { ExamPeriod } from './types'

const toArray = (payload: unknown): ExamPeriod[] => normalizePage<ExamPeriod>(payload).data

/** Every exam period belongs to exactly one academic year — the list always filters by it. */
export function useExamPeriods(academicYearId: string, enabled = true) {
  return useQuery({
    queryKey: schoolKeys.examPeriodList(academicYearId),
    queryFn: async ({ signal }) =>
      toArray(
        await schoolApi.get('/school/exam-periods', { academic_year_id: academicYearId }, { signal }),
      ),
    enabled: enabled && academicYearId !== '',
    staleTime: 60 * 1000,
  })
}

export function useSaveExamPeriod() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: unknown }) =>
      id === null
        ? schoolApi.post<ExamPeriod>('/school/exam-periods', values)
        : schoolApi.put<ExamPeriod>(`/school/exam-periods/${id}`, values),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.examPeriods() }),
  })
}

export function useDeleteExamPeriod() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schoolApi.del<null>(`/school/exam-periods/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.examPeriods() }),
  })
}
