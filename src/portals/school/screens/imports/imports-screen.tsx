import { useRef, useState } from 'react'
import { isValidationError } from '~/lib/api/error'
import { validationText } from '~/lib/forms/validation.i18n'
import { formatDateTime } from '~/lib/format'
import { useLocale } from '~/lib/i18n/locale-context'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Field } from '~/ui/field'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { ProgressBar } from '~/ui/spinner'
import { useToast } from '~/ui/toast'
import { IMPORT_EXTENSIONS, IMPORT_MAX_BYTES, useImportHistory, useUploadResults } from '../../api/imports'
import type { ImportReport } from '../../api/types'
import { useCurriculumNames } from '../../api/use-options'
import { AcademicYearField, GradeField, TermField } from '../../components/term-grade-fields'
import { schoolText } from '../../school.i18n'
import { ImportReportPanel } from './import-report-panel'
import { importsText } from './imports.i18n'

const MAX_MB = IMPORT_MAX_BYTES / 1024 / 1024

export function ImportsScreen() {
  const text = useDict(importsText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const { locale } = useLocale()
  const { notify, notifyError } = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const { termName, gradeName } = useCurriculumNames()

  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<ImportReport | null>(null)
  // Set only after a 422 asks for one explicitly — most sheets never need
  // these, so they stay hidden until the backend says it can't detect one.
  const [needsGrade, setNeedsGrade] = useState(false)
  const [needsTerm, setNeedsTerm] = useState(false)
  const [needsAcademicYear, setNeedsAcademicYear] = useState(false)
  const [gradeId, setGradeId] = useState('')
  const [termId, setTermId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')

  const history = useImportHistory()
  const upload = useUploadResults()

  const resetUpload = () => {
    setReport(null)
    setFile(null)
    setNeedsGrade(false)
    setNeedsTerm(false)
    setNeedsAcademicYear(false)
    setGradeId('')
    setTermId('')
    setAcademicYearId('')
    if (fileInput.current) fileInput.current.value = ''
    upload.reset()
  }

  const submit = async () => {
    if (!file) return notify('danger', text.noFile)
    if (file.size > IMPORT_MAX_BYTES) return notify('danger', v.fileTooLarge(MAX_MB))

    try {
      setReport(
        await upload.mutateAsync({
          file,
          gradeId: gradeId || undefined,
          termId: termId || undefined,
          academicYearId: academicYearId || undefined,
        }),
      )
      setNeedsGrade(false)
      setNeedsTerm(false)
      setNeedsAcademicYear(false)
    } catch (error) {
      // A sheet with no detectable grade/term (grades 1-2 never split
      // results by term at all) or no "العام الدراسى ..." metadata line —
      // reveal the matching picker instead of just showing the error, so
      // the operator can retry immediately.
      if (isValidationError(error)) {
        if (error.fieldErrors.grade_id) setNeedsGrade(true)
        if (error.fieldErrors.term_id) setNeedsTerm(true)
        if (error.fieldErrors.academic_year_id) setNeedsAcademicYear(true)
      }
      notifyError(error, shell.error.title)
    }
  }

  const historyColumns: readonly Column<ImportReport>[] = [
    { key: 'file', header: text.historyColumns.file, cell: (row) => row.file_name },
    { key: 'grade', header: text.historyColumns.grade, cell: (row) => gradeName(row.grade_id) },
    { key: 'term', header: text.historyColumns.term, cell: (row) => termName(row.term_id) },
    { key: 'students', header: text.historyColumns.students, numeric: true, cell: (row) => row.total_rows },
    { key: 'imported', header: text.historyColumns.imported, numeric: true, cell: (row) => row.imported_rows },
    { key: 'errors', header: text.historyColumns.errors, numeric: true, cell: (row) => row.invalid_rows },
    {
      key: 'date',
      header: text.historyColumns.date,
      numeric: true,
      cell: (row) => formatDateTime(row.created_at, locale),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      <Card>
        <CardHeader title={text.uploadTitle} />
        <CardBody className="flex flex-col gap-4">
          <p className="max-w-prose text-small text-muted">{text.uploadHint}</p>

          {needsGrade || needsTerm || needsAcademicYear ? (
            <div className="flex flex-col gap-3 rounded-control border border-line border-s-2 border-s-attention bg-sunken px-4 py-3">
              <p className="flex items-center gap-2 text-small text-attention">
                <Icon name="alert" className="size-4" />
                {needsAcademicYear && !needsGrade && !needsTerm ? text.yearDetectionFailed : text.detectionFailed}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:max-w-md">
                {needsAcademicYear ? (
                  <AcademicYearField
                    value={academicYearId}
                    onChange={setAcademicYearId}
                    placeholder={shell.pickers.pickYear}
                    required
                  />
                ) : null}
                {needsGrade ? (
                  <GradeField value={gradeId} onChange={setGradeId} placeholder={shell.pickers.pickGrade} required />
                ) : null}
                {needsTerm ? (
                  <TermField value={termId} onChange={setTermId} placeholder={shell.pickers.pickTerm} required />
                ) : null}
              </div>
            </div>
          ) : null}

          <Field label={text.file} hint={text.fileHint} required>
            {(props) => (
              <input
                {...props}
                ref={fileInput}
                type="file"
                accept={IMPORT_EXTENSIONS.join(',')}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="h-10 w-full rounded-control border border-line bg-surface px-3 py-2 text-small text-ink file:me-3 file:rounded-control file:border-0 file:bg-sunken file:px-3 file:py-1 file:text-ink"
              />
            )}
          </Field>

          {upload.isPending ? <ProgressBar label={text.uploading} /> : null}

          <div className="flex justify-end">
            <Button
              variant="primary"
              loading={upload.isPending}
              disabled={
                file === null ||
                (needsGrade && gradeId === '') ||
                (needsTerm && termId === '') ||
                (needsAcademicYear && academicYearId === '')
              }
              onClick={submit}
            >
              <Icon name="upload" />
              {text.upload}
            </Button>
          </div>
        </CardBody>
      </Card>

      {report ? (
        <ImportReportPanel
          report={report}
          onStartOver={resetUpload}
          detectedGradeName={report.gradeDetectedFromSheet ? gradeName(report.grade_id) : null}
          detectedTermName={report.termDetectedFromSheet ? termName(report.term_id) : null}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-h1 font-semibold text-ink">{text.historyTitle}</h2>
        {history.isError ? (
          <ErrorState error={history.error} onRetry={() => void history.refetch()} labels={shell.error} />
        ) : (
          <DataTable
            caption={text.historyTitle}
            columns={historyColumns}
            rows={history.data?.data ?? []}
            rowKey={(row) => String(row.id)}
            isLoading={history.isPending}
            empty={<EmptyState title={text.historyTitle} description={text.historyEmpty} />}
          />
        )}
      </div>
    </div>
  )
}
