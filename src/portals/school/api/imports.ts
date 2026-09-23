import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { ImportReport } from './types'

export const IMPORT_MAX_BYTES = 10 * 1024 * 1024
export const IMPORT_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export type UploadResultsInput = {
  file: File
  /**
   * Only needed when a first attempt came back 422 asking for one of
   * these explicitly — some sheets (e.g. grades 1-2, which don't split
   * results by term at all) genuinely carry no detectable grade/term,
   * and a sheet with no "العام الدراسى ..." metadata line needs an
   * explicit academic year when the school also has none marked current.
   */
  gradeId?: string
  termId?: string
  academicYearId?: string
}

/**
 * One step in the common case: just the file. The backend reads the
 * academic year, grade and term straight off the sheet's own metadata
 * text — gradeId/termId/academicYearId are only sent when a previous
 * attempt asked for one explicitly (see ImportsScreen's fallback picker).
 */
export function useUploadResults() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ file, gradeId, termId, academicYearId }: UploadResultsInput) => {
      const form = new FormData()
      form.append('file', file)
      if (gradeId) form.append('grade_id', gradeId)
      if (termId) form.append('term_id', termId)
      if (academicYearId) form.append('academic_year_id', academicYearId)
      return schoolApi.upload<ImportReport>('/school/result-imports', form)
    },
    onSuccess: (report) => {
      client.setQueryData(schoolKeys.import(String(report.id)), report)
      // A single-call import can silently create almost anything it
      // doesn't find already set up — grade, educational stage, subjects,
      // exam period, classroom, students, enrollments — on top of the
      // results themselves (see the backend's ResultImportController
      // resolve*() methods). Invalidating the whole school cache, not
      // just imports/results/reports, is what keeps pickers like the
      // grade/term filters from showing stale options right after an
      // import that just created the very grade being filtered on.
      void client.invalidateQueries({ queryKey: schoolKeys.all })
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

/**
 * The backend now processes an import's rows on a queue worker instead of
 * inline in the upload request (see ResultImportController::store()) — the
 * upload response comes back with status "processing" and zeroed counts,
 * not the final report. Polling here is what turns that into a report that
 * actually updates once the worker finishes: every 1.5s while status is
 * still "processing", stopping the moment it flips to "completed"/"failed"
 * (refetchInterval returning false cancels further polling).
 */
export function useImportReport(id: string) {
  return useQuery({
    queryKey: schoolKeys.import(id),
    queryFn: ({ signal }) =>
      schoolApi.get<ImportReport>(`/school/result-imports/${id}`, undefined, { signal }),
    enabled: id !== '',
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  })
}
