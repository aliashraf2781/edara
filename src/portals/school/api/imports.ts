import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { ImportPreview, ImportReport, ImportSubjectMapping } from './types'

export const IMPORT_MAX_BYTES = 10 * 1024 * 1024
export const IMPORT_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export type PreviewImportInput = {
  file: File
  academic_year_id: string
  exam_period_id: string
}

export type ConfirmImportInput = {
  resultImportId: string
  mapping: ImportSubjectMapping[]
}

/** Step 1 — parse the sheet and return suggested column→subject mappings. Writes nothing. */
export function usePreviewImport() {
  return useMutation({
    mutationFn: ({ file, academic_year_id, exam_period_id }: PreviewImportInput) => {
      const form = new FormData()
      form.append('file', file)
      form.append('academic_year_id', academic_year_id)
      form.append('exam_period_id', exam_period_id)
      return schoolApi.upload<ImportPreview>('/school/result-imports/preview', form)
    },
  })
}

/** Step 2 — commit the operator-confirmed mapping. Integers only; never column letters or Arabic labels. */
export function useConfirmImport() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ resultImportId, mapping }: ConfirmImportInput) =>
      schoolApi.post<ImportReport>(`/school/result-imports/${resultImportId}/confirm`, { mapping }),
    onSuccess: (report) => {
      client.setQueryData(schoolKeys.import(String(report.id)), report)
      void client.invalidateQueries({ queryKey: schoolKeys.results() })
    },
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
