import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import type { QueryParams } from '~/lib/api/query'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { Enrollment, Student } from './types'

export type StudentListParams = { page: number; perPage: number; search: string }

const toQuery = (params: StudentListParams): QueryParams => ({
  page: params.page,
  per_page: params.perPage,
  search: params.search,
})

/** Search covers student code, national ID and first/family name. */
export function useStudentList(params: StudentListParams) {
  const query = toQuery(params)
  return useQuery({
    queryKey: schoolKeys.studentList(query),
    queryFn: async ({ signal }) =>
      normalizePage<Student>(
        await schoolApi.get('/school/students', query, { signal }),
        params.perPage,
      ),
    placeholderData: (previous) => previous,
  })
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: schoolKeys.student(id),
    queryFn: ({ signal }) => schoolApi.get<Student>(`/school/students/${id}`, undefined, { signal }),
    enabled: id !== '',
  })
}

export type StudentDraft = {
  student_code: string
  national_id?: string
  first_name: string
  father_name?: string
  family_name?: string
  gender: 'male' | 'female'
  birth_date?: string
  guardian_name?: string
  guardian_phone?: string
}

export function useSaveStudent() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: StudentDraft }) =>
      id === null
        ? schoolApi.post<Student>('/school/students', values)
        : schoolApi.put<Student>(`/school/students/${id}`, values),
    onSuccess: (student) => {
      client.setQueryData(schoolKeys.student(student.id), student)
      void client.invalidateQueries({ queryKey: schoolKeys.students() })
    },
  })
}

export function useDeleteStudent() {
  const client = useQueryClient()
  return useMutation({
    // Soft delete, and admin-only.
    mutationFn: (id: string) => schoolApi.del<null>(`/school/students/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.students() }),
  })
}

export type EnrollmentDraft = {
  academic_year_id: string
  grade_id: string
  classroom_id: string
  enrolled_on?: string
}

/**
 * A student's grade and classroom are enrollment history, not fields on the
 * student — which is why they never appear on the student form.
 */
export function useEnrollments(studentId: string) {
  return useQuery({
    queryKey: schoolKeys.enrollments(studentId),
    queryFn: ({ signal }) =>
      schoolApi.get<Enrollment[]>(`/school/students/${studentId}/enrollments`, undefined, { signal }),
    enabled: studentId !== '',
  })
}

export function useEnrollStudent(studentId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (values: EnrollmentDraft) =>
      schoolApi.post<Enrollment>(`/school/students/${studentId}/enrollments`, values),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: schoolKeys.enrollments(studentId) })
      void client.invalidateQueries({ queryKey: schoolKeys.student(studentId) })
    },
  })
}
