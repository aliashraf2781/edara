import { useQuery } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import type { QueryParams } from '~/lib/api/query'
import { adminApi } from './client'
import { adminKeys } from './keys'
import type {
  AdminReference,
  SchoolResultRow,
  SchoolStats,
  SchoolStudentRow,
  StudentDetail,
} from './types'

/**
 * The read-only windows the management portal has into a school's data. Every
 * endpoint here answers without a school login, so the operator never has to
 * switch portals to read a figure.
 */

/**
 * Grades, terms, classrooms and subjects — but one school's own, never a
 * cross-school "canonical" set, since each school defines its structure
 * freely (there is no shared curriculum to fall back to). `code` is
 * required; pass '' only where there genuinely is no single school in
 * view (the cross-school overview screen), which disables the query
 * rather than hitting an endpoint that can't answer for many schools at
 * once — that screen needs its own term-by-name design, not this.
 */
export function useAdminReference(code: string) {
  return useQuery({
    queryKey: adminKeys.reference(code),
    queryFn: ({ signal }) =>
      adminApi.get<AdminReference>(`/admin/tenants/${code}/reference`, undefined, { signal }),
    enabled: code !== '',
    staleTime: 30 * 60 * 1000,
  })
}

export function useSchoolInsights(termId: string) {
  return useQuery({
    queryKey: adminKeys.schoolInsights(termId),
    queryFn: ({ signal }) =>
      adminApi.get<SchoolStats[]>('/admin/insights/schools', { term_id: termId }, { signal }),
    placeholderData: (previous) => previous,
  })
}

export function useSchoolStats(code: string, termId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.schoolStats(code, termId),
    queryFn: ({ signal }) =>
      adminApi.get<SchoolStats>(`/admin/tenants/${code}/stats`, { term_id: termId }, { signal }),
    enabled: enabled && code !== '',
    placeholderData: (previous) => previous,
  })
}

export type SchoolStudentParams = {
  page: number
  perPage: number
  search: string
  gradeId: string
  classroomId: string
}

const studentQuery = (params: SchoolStudentParams): QueryParams => ({
  page: params.page,
  per_page: params.perPage,
  search: params.search,
  grade_id: params.gradeId,
  classroom_id: params.classroomId,
})

export function useSchoolStudents(code: string, params: SchoolStudentParams, enabled = true) {
  const query = studentQuery(params)
  return useQuery({
    queryKey: adminKeys.schoolStudents(code, query),
    queryFn: async ({ signal }) =>
      normalizePage<SchoolStudentRow>(
        await adminApi.get(`/admin/tenants/${code}/students`, query, { signal }),
        params.perPage,
      ),
    enabled: enabled && code !== '',
    placeholderData: (previous) => previous,
  })
}

export function useSchoolStudent(code: string, id: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.schoolStudent(code, id),
    queryFn: ({ signal }) =>
      adminApi.get<StudentDetail>(`/admin/tenants/${code}/students/${id}`, undefined, { signal }),
    enabled: enabled && code !== '' && id !== '',
  })
}

export type SchoolResultParams = SchoolStudentParams & {
  termId: string
  subjectId: string
}

const resultQuery = (params: SchoolResultParams): QueryParams => ({
  ...studentQuery(params),
  term_id: params.termId,
  subject_id: params.subjectId,
})

export function useSchoolResults(code: string, params: SchoolResultParams, enabled = true) {
  const query = resultQuery(params)
  return useQuery({
    queryKey: adminKeys.schoolResults(code, query),
    queryFn: async ({ signal }) =>
      normalizePage<SchoolResultRow>(
        await adminApi.get(`/admin/tenants/${code}/results`, query, { signal }),
        params.perPage,
      ),
    enabled: enabled && code !== '',
    placeholderData: (previous) => previous,
  })
}
