import { useQuery } from '@tanstack/react-query'
import type { QueryParams } from '~/lib/api/query'
import { adminApi } from './client'
import { adminKeys } from './keys'
import type {
  AdminReference,
  GradeStat,
  SchoolResultRow,
  SchoolStats,
  SchoolStudentRow,
  StudentDetail,
  SubjectStat,
} from './types'

/**
 * The read-only windows the management portal has into a school's data. Every
 * endpoint here answers without a school login, so the operator never has to
 * switch portals to read a figure.
 */

/** Laravel may send either camelCase or snake_case for the aggregate fields. */
function normalizeSchoolStats(raw: unknown): SchoolStats {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    code: String(row.code ?? ''),
    name: String(row.name ?? ''),
    students: Number(row.students ?? 0),
    results: Number(row.results ?? 0),
    passed: Number(row.passed ?? 0),
    passRate: Number(row.passRate ?? row.pass_rate ?? 0),
    average: Number(row.average ?? 0),
    byGrade: (Array.isArray(row.byGrade)
      ? row.byGrade
      : Array.isArray(row.by_grade)
        ? row.by_grade
        : []) as GradeStat[],
    bySubject: (Array.isArray(row.bySubject)
      ? row.bySubject
      : Array.isArray(row.by_subject)
        ? row.by_subject
        : []) as SubjectStat[],
  }
}

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
    queryFn: async ({ signal }) => {
      const rows = await adminApi.get<unknown[]>('/admin/insights/schools', { term_id: termId }, { signal })
      return (Array.isArray(rows) ? rows : []).map(normalizeSchoolStats)
    },
    enabled: termId !== '',
    placeholderData: (previous) => previous,
  })
}

export function useSchoolStats(code: string, termId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.schoolStats(code, termId),
    queryFn: async ({ signal }) =>
      normalizeSchoolStats(
        await adminApi.get<unknown>(`/admin/tenants/${code}/stats`, { term_id: termId }, { signal }),
      ),
    enabled: enabled && code !== '' && termId !== '',
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
      adminApi.getPage<SchoolStudentRow>(`/admin/tenants/${code}/students`, query, { signal }, params.perPage),
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
      adminApi.getPage<SchoolResultRow>(`/admin/tenants/${code}/results`, query, { signal }, params.perPage),
    enabled: enabled && code !== '',
    placeholderData: (previous) => previous,
  })
}
