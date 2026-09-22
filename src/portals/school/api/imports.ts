import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { ImportReport } from './types'

export const IMPORT_MAX_BYTES = 10 * 1024 * 1024
export const IMPORT_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export type UploadResultsInput = {
  file: File
}

/**
 * One step, one field: the file. The backend reads the academic year,
 * grade and term straight off the sheet's own metadata text — there is
 * nothing left for the operator to pick beforehand.
 */
export function useUploadResults() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ file }: UploadResultsInput) => {
      const form = new FormData()
      form.append('file', file)
      return schoolApi.upload<ImportReport>('/school/result-imports', form)
    },
    onSuccess: (report) => {
      client.setQueryData(schoolKeys.import(String(report.id)), report)
      void client.invalidateQueries({ queryKey: schoolKeys.imports() })
      // Marks land published, so the lists and the report figures both move.
      void client.invalidateQueries({ queryKey: schoolKeys.results() })
      void client.invalidateQueries({ queryKey: schoolKeys.reports() })
    },
  })
}

export function useImportHistory(perPage = 5) {
  const query = { page: 1, per_page: perPage }
  return useQuery({
    queryKey: schoolKeys.importList(query),
    queryFn: async ({ signal }) =>
      normalizePage<ImportReport>(
        await schoolApi.get('/school/result-imports', query, { signal }),
        perPage,
      ),
  })
}

export function useImportReport(id: string) {
  return useQuery({
    queryKey: schoolKeys.import(id),
    queryFn: ({ signal }) =>
      schoolApi.get<ImportReport>(`/school/result-imports/${id}`, undefined, { signal }),
    enabled: id !== '',
  })
}
