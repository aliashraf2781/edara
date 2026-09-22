import type { QueryParams } from '~/lib/api/query'

/** One root per portal: signing out drops this school's cache and nothing else. */
export const schoolKeys = {
  all: ['school'] as const,
  identity: () => [...schoolKeys.all, 'identity'] as const,
  academics: (resource: string) => [...schoolKeys.all, 'academics', resource] as const,
  academicsList: (resource: string, params: QueryParams) =>
    [...schoolKeys.academics(resource), 'list', params] as const,
  examPeriods: () => [...schoolKeys.all, 'exam-periods'] as const,
  examPeriodList: (academicYearId: string) =>
    [...schoolKeys.examPeriods(), 'list', academicYearId] as const,
  students: () => [...schoolKeys.all, 'students'] as const,
  studentList: (params: QueryParams) => [...schoolKeys.students(), 'list', params] as const,
  student: (id: string) => [...schoolKeys.students(), 'detail', id] as const,
  enrollments: (studentId: string) => [...schoolKeys.student(studentId), 'enrollments'] as const,
  results: () => [...schoolKeys.all, 'results'] as const,
  resultList: (params: QueryParams) => [...schoolKeys.results(), 'list', params] as const,
  result: (id: string) => [...schoolKeys.results(), 'detail', id] as const,
  imports: () => [...schoolKeys.all, 'result-imports'] as const,
  import: (id: string) => [...schoolKeys.imports(), id] as const,
  report: (examPeriodId: string) => [...schoolKeys.all, 'reports', examPeriodId] as const,
  staff: () => [...schoolKeys.all, 'staff'] as const,
  staffList: (params: QueryParams) => [...schoolKeys.staff(), 'list', params] as const,
}
