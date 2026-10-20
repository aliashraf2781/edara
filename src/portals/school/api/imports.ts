import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isValidationError } from '~/lib/api/error'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { ImportReport } from './types'

export const IMPORT_MAX_BYTES = 10 * 1024 * 1024
export const IMPORT_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export type UploadResultsInput = {
  file: File
  /**
   * The term the operator picked. Always sent when there is one: it wins over
   * whatever the sheet says, so a wrong-looking sheet still imports where the
   * operator told it to. Left out only when the school has no terms to pick,
   * or the server has not yet been asked.
   *
   * The grade and academic year below are only needed when a first attempt
   * came back 422 asking for one — some sheets (e.g. grades 1-2, which don't
   * split results by term at all) carry no detectable grade, and a sheet
   * with no "العام الدراسى ..." metadata line needs an explicit academic year
   * when the school also has none marked current.
   */
  termId?: string
  gradeId?: string
  academicYearId?: string
}

/** A term the school can import into, as the term-unclear 422 lists them. */
export type AvailableTerm = { id: string; name: string; term: number | null }

export type TermRequest = {
  /** The server's own sentence (`data.term_id[0]`), already localised. */
  message: string | null
  /** Empty when the server sent none; the screen then falls back to the school's own terms. */
  availableTerms: AvailableTerm[]
}

const readAvailableTerms = (value: unknown): AvailableTerm[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry): AvailableTerm[] => {
    if (typeof entry !== 'object' || entry === null) return []
    const { id, name, term } = entry as Record<string, unknown>
    const validId = typeof id === 'number' || (typeof id === 'string' && id !== '')
    if (!validId || typeof name !== 'string') return []
    return [{ id: String(id), name, term: typeof term === 'number' ? term : null }]
  })
}

/**
 * Reads the 422 an upload without `term_id` gets when the sheet does not name
 * its term. `termCheck` and `availableTerms` ride inside `data` next to the
 * field error but are an object and an array of objects, so `ApiError` keeps
 * them in `extras` and only `term_id` is a field error. Null for any other
 * failure, including a 422 about some other field.
 */
export function readTermRequest(error: unknown): TermRequest | null {
  if (!isValidationError(error) || !error.fieldErrors.term_id) return null
  return {
    message: error.fieldErrors.term_id[0] ?? null,
    availableTerms: readAvailableTerms(error.extras?.availableTerms),
  }
}

export type TermCheckStatus = 'match' | 'mismatch' | 'unverified'

export type TermCheck = {
  status: TermCheckStatus
  /** The server's advice sentence, already localised. */
  message: string | null
  /** The term the sheet seems to be for; null when nothing was found. */
  detected: { term: number | null; name: string } | null
  /** Every term the school can switch to. */
  availableTerms: AvailableTerm[]
}

const STATUSES: readonly string[] = ['match', 'mismatch', 'unverified']

/** Null for anything that is not a recognisable `termCheck`, so the UI shows nothing. */
function readTermCheck(data: unknown): TermCheck | null {
  if (typeof data !== 'object' || data === null) return null
  const { termCheck, availableTerms } = data as Record<string, unknown>
  if (typeof termCheck !== 'object' || termCheck === null) return null
  const { status, message, detected } = termCheck as Record<string, unknown>
  if (typeof status !== 'string' || !STATUSES.includes(status)) return null

  let found: TermCheck['detected'] = null
  if (typeof detected === 'object' && detected !== null) {
    const { term, name } = detected as Record<string, unknown>
    if (typeof name === 'string') found = { term: typeof term === 'number' ? term : null, name }
  }

  return {
    status: status as TermCheckStatus,
    message: typeof message === 'string' && message !== '' ? message : null,
    detected: found,
    availableTerms: readAvailableTerms(availableTerms),
  }
}

/**
 * Asks the server which term the sheet looks like it is for, so a wrong pick
 * can be flagged before uploading. Advice only: it never blocks anything, and
 * any failure (bad file, offline, 422) is swallowed, since the real upload
 * reports its own errors. Keyed by the file's identity and the term so each
 * new pair is checked once; the server writes nothing for a preview.
 */
export function useTermCheck(file: File | null, term: { id: string; academicYearId: string } | null) {
  return useQuery({
    queryKey: [
      ...schoolKeys.imports(),
      'term-check',
      file?.name,
      file?.size,
      file?.lastModified,
      term?.id,
    ] as const,
    queryFn: async ({ signal }) => {
      const form = new FormData()
      form.append('file', file as File)
      form.append('exam_period_id', (term as { id: string }).id)
      form.append('academic_year_id', (term as { academicYearId: string }).academicYearId)
      const data = await schoolApi.upload<unknown>('/school/result-imports/preview', form, { signal })
      return readTermCheck(data)
    },
    enabled: file !== null && term !== null && term.academicYearId !== '',
    retry: false,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * One step in the common case: the file plus the term the operator picked.
 * A `termId` that is sent always wins over whatever the sheet says; without
 * one the backend only imports when it can read the term confidently, and
 * otherwise answers 422 (see `readTermRequest`). The grade and academic year
 * are still read off the sheet and are only sent when a previous attempt
 * asked for one explicitly (see ImportsScreen's fallback picker).
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
      schoolApi.getPage<ImportReport>('/school/result-imports', query, { signal }, perPage),
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
