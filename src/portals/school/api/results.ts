import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import type { QueryParams } from '~/lib/api/query'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { QualitativeRating, Result, ResultStatus } from './types'

export type ResultListParams = {
  page: number
  perPage: number
  termId: string
  gradeId: string
  classroomId: string
  subjectId: string
  status: string
}

const toQuery = (params: ResultListParams): QueryParams => ({
  page: params.page,
  per_page: params.perPage,
  term_id: params.termId,
  grade_id: params.gradeId,
  classroom_id: params.classroomId,
  subject_id: params.subjectId,
  status: params.status,
})

export function useResultList(params: ResultListParams) {
  const query = toQuery(params)
  return useQuery({
    queryKey: schoolKeys.resultList(query),
    queryFn: async ({ signal }) =>
      normalizePage<Result>(
        await schoolApi.get('/school/results', query, { signal }),
        params.perPage,
      ),
    placeholderData: (previous) => previous,
  })
}

/** One grade's marks for a term, unpaginated — 13 subjects × one roster. */
const BREAKDOWN_PER_PAGE = 2000

/** Backs the reports by-subject table, which the summary endpoint does not cover. */
export function useGradeTermResults(termId: string, gradeId: string) {
  const query: QueryParams = {
    term_id: termId,
    grade_id: gradeId,
    page: 1,
    per_page: BREAKDOWN_PER_PAGE,
  }
  return useQuery({
    queryKey: schoolKeys.resultList(query),
    queryFn: async ({ signal }) =>
      normalizePage<Result>(
        await schoolApi.get('/school/results', query, { signal }),
        BREAKDOWN_PER_PAGE,
      ).data,
    enabled: termId !== '' && gradeId !== '',
    staleTime: 0,
  })
}

export function useResult(id: string) {
  return useQuery({
    queryKey: schoolKeys.result(id),
    queryFn: ({ signal }) => schoolApi.get<Result>(`/school/results/${id}`, undefined, { signal }),
    enabled: id !== '',
  })
}

export type ResultDraft = {
  student_enrollment_id: string
  subject_id: string
  /** The chosen term id — the endpoint still names the field after the period. */
  exam_period_id: string
  is_absent: boolean
  // Numeric subjects send score/max_score; qualitative subjects send
  // qualitative_rating instead — never both.
  score?: number
  max_score?: number
  qualitative_rating?: QualitativeRating
}

/**
 * Upserts: the same enrollment, subject and term updates the existing draft
 * instead of creating a second row. Always lands in `draft`.
 */
export function useSaveResult() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (values: ResultDraft) => schoolApi.post<Result>('/school/results', values),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: schoolKeys.results() })
      // A student's report card (useStudentTermResults) lives under
      // schoolKeys.students(), not schoolKeys.results() — without this,
      // saving a mark from the report-card view left the just-edited cell
      // showing its old value until an unrelated refetch happened to run.
      void client.invalidateQueries({ queryKey: schoolKeys.students() })
    },
  })
}

export function useTransitionResult(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ status, reason }: { status: ResultStatus; reason?: string }) =>
      schoolApi.post<Result>(`/school/results/${id}/transition`, { status, reason }),
    onSuccess: (result) => {
      client.setQueryData(schoolKeys.result(id), result)
      void client.invalidateQueries({ queryKey: schoolKeys.results() })
    },
  })
}
