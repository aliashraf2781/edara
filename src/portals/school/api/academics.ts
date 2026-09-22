import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import type { QueryParams } from '~/lib/api/query'
import { schoolApi } from './client'
import { schoolKeys } from './keys'

/** The five reference resources, each a standard REST route under /school. */
export const ACADEMIC_RESOURCES = [
  'academic-years',
  'educational-stages',
  'grades',
  'classrooms',
  'subjects',
] as const

export type AcademicResource = (typeof ACADEMIC_RESOURCES)[number]

/**
 * Reference lists come back either as a bare array or inside a page envelope
 * depending on the resource, so both shapes are normalised here rather than
 * in every screen.
 */
const toArray = <T,>(payload: unknown): T[] => normalizePage<T>(payload).data

export function useAcademicList<T>(
  resource: AcademicResource,
  params: QueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: schoolKeys.academicsList(resource, params),
    queryFn: async ({ signal }) =>
      toArray<T>(await schoolApi.get(`/school/${resource}`, params, { signal })),
    enabled,
    // Reference data barely moves; every screen that needs a picker reuses it.
    staleTime: 5 * 60 * 1000,
  })
}

export function useSaveAcademic<T>(resource: AcademicResource) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: unknown }) =>
      id === null
        ? schoolApi.post<T>(`/school/${resource}`, values)
        : schoolApi.put<T>(`/school/${resource}/${id}`, values),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.academics(resource) }),
  })
}

export function useDeleteAcademic(resource: AcademicResource) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schoolApi.del<null>(`/school/${resource}/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: schoolKeys.academics(resource) }),
  })
}
