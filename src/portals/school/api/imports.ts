import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePage } from '~/lib/api/normalize'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type {
  ImportCandidate,
  ImportMappingEntry,
  ImportPreview,
  ImportPreviewSubject,
  ImportReport,
  ImportSubjectNote,
} from './types'

type Raw = Record<string, unknown>
const asRaw = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {})
const pick = (raw: Raw, ...keys: string[]): unknown => {
  for (const key of keys) if (raw[key] !== undefined && raw[key] !== null) return raw[key]
  return undefined
}
const str = (value: unknown): string | null =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : null

/** Fills defaults the backend may omit so panels never branch on undefined. */
export function normalizeReport(payload: ImportReport): ImportReport {
  const raw = asRaw(payload)
  const notes = pick(raw, 'subjectNotes', 'subject_notes')
  const rolled = pick(raw, 'rolledBackResults', 'rolled_back_results')
  return {
    ...payload,
    subjectNotes: Array.isArray(notes) ? (notes as ImportSubjectNote[]) : [],
    rolledBackResults: typeof rolled === 'number' ? rolled : null,
  }
}

const normalizeCandidate = (value: unknown): ImportCandidate | null => {
  const raw = asRaw(value)
  const id = str(pick(raw, 'subjectId', 'subject_id', 'id'))
  if (id === null) return null
  const score = Number(pick(raw, 'score') ?? 0)
  return {
    subjectId: id,
    subjectName: str(pick(raw, 'subjectName', 'subject_name', 'name')) ?? id,
    score: Number.isFinite(score) ? (score > 1 ? score / 100 : score) : 0,
  }
}

export function normalizePreview(payload: unknown): ImportPreview {
  const raw = asRaw(payload)
  const list = pick(raw, 'subjects')
  const subjects: ImportPreviewSubject[] = (Array.isArray(list) ? list : []).flatMap((item, index) => {
    const row = asRaw(item)
    const sheetIndex = Number(pick(row, 'sheetIndex', 'sheet_index') ?? index)
    const suggested = str(pick(row, 'suggestedSubjectId', 'suggested_subject_id'))
    const status = pick(row, 'status')
    const candidates = pick(row, 'candidates')
    return [
      {
        sheetIndex,
        sheetName: str(pick(row, 'sheetName', 'sheet_name', 'name')) ?? String(sheetIndex),
        suggestedSubjectId: suggested,
        suggestedSubjectName: str(pick(row, 'suggestedSubjectName', 'suggested_subject_name')),
        status:
          status === 'matched' || status === 'needs_review'
            ? status
            : suggested !== null
              ? 'matched'
              : 'needs_review',
        candidates: (Array.isArray(candidates) ? candidates : [])
          .map(normalizeCandidate)
          .filter((c): c is ImportCandidate => c !== null),
      },
    ]
  })
  return {
    id: String(pick(raw, 'id', 'resultImportId', 'result_import_id') ?? ''),
    gradeId: str(pick(raw, 'gradeId', 'grade_id')),
    subjects,
  }
}

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
    onSuccess: (response) => {
      const report = normalizeReport(response)
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
        await schoolApi.getList('/school/result-imports', query, { signal }),
        perPage,
      ),
    select: (page) => ({ ...page, data: page.data.map(normalizeReport) }),
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
      schoolApi
        .get<ImportReport>(`/school/result-imports/${id}`, undefined, { signal })
        .then(normalizeReport),
    enabled: id !== '',
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  })
}

export type PreviewInput = UploadResultsInput

/** Step 1: nothing is written until confirm; returns the sheet-to-subject suggestions. */
export function usePreviewImport() {
  return useMutation({
    mutationFn: async ({ file, gradeId, termId, academicYearId }: PreviewInput) => {
      const form = new FormData()
      form.append('file', file)
      if (gradeId) form.append('grade_id', gradeId)
      if (termId) form.append('term_id', termId)
      if (academicYearId) form.append('academic_year_id', academicYearId)
      return normalizePreview(await schoolApi.upload<unknown>('/school/result-imports/preview', form))
    },
  })
}

/** Step 2: sends the human-confirmed mapping; unlisted sheet columns are skipped. */
export function useConfirmImport() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, mapping }: { id: string; mapping: ImportMappingEntry[] }) =>
      schoolApi.post<ImportReport>(`/school/result-imports/${id}/confirm`, { mapping }),
    onSuccess: (response) => {
      const report = normalizeReport(response)
      client.setQueryData(schoolKeys.import(String(report.id)), report)
      void client.invalidateQueries({ queryKey: schoolKeys.all })
    },
  })
}

export function useRollbackImport() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      schoolApi.post<ImportReport>(`/school/result-imports/${id}/rollback`),
    onSuccess: (response) => {
      const report = normalizeReport(response)
      client.setQueryData(schoolKeys.import(String(report.id)), report)
      void client.invalidateQueries({ queryKey: schoolKeys.all })
    },
  })
}
