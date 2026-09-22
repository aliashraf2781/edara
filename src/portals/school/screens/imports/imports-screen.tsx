import { useRef, useState } from 'react'
import { validationText } from '~/lib/forms/validation.i18n'
import { formatDateTime } from '~/lib/format'
import { useLocale } from '~/lib/i18n/locale-context'
import { useDict } from '~/lib/i18n/use-dict'
import { downloadResultsTemplate } from '~/lib/sheets/results-template'
import { subjectsForGrade, type CurriculumSubject } from '~/mocks/curriculum'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Field } from '~/ui/field'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { ProgressBar, Spinner } from '~/ui/spinner'
import { useToast } from '~/ui/toast'
import { IMPORT_EXTENSIONS, IMPORT_MAX_BYTES, useImportHistory, useUploadResults } from '../../api/imports'
import { useRoster } from '../../api/roster'
import type { ImportReport } from '../../api/types'
import { gradeName, termName } from '../../components/curriculum-options'
import { GradeField, TermField } from '../../components/term-grade-fields'
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

  const [termId, setTermId] = useState('')
  const [gradeId, setGradeId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<ImportReport | null>(null)

  // Fetched as soon as a grade is picked, so the download itself is instant.
  const roster = useRoster(gradeId)
  const history = useImportHistory()
  const upload = useUploadResults()

  const chosen = termId !== '' && gradeId !== ''
  const subjects = gradeId === '' ? [] : subjectsForGrade(gradeId)

  const download = () => {
    if (!roster.data) return
    downloadResultsTemplate({
      schoolName: roster.data.school.name,
      gradeName: roster.data.grade.name,
      termName: termName(termId),
      subjects: roster.data.subjects,
      students: roster.data.students,
      prefill: true,
    })
    notify('success', text.downloaded)
  }

  const resetUpload = () => {
    setReport(null)
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
    upload.reset()
  }

  const submit = async () => {
    if (!file) return notify('danger', text.noFile)
    // The only client-side check: the sheet itself is never second-guessed here.
    if (file.size > IMPORT_MAX_BYTES) return notify('danger', v.fileTooLarge(MAX_MB))

    try {
      setReport(await upload.mutateAsync({ file, gradeId, termId }))
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const subjectColumns: readonly Column<CurriculumSubject>[] = [
    {
      key: 'order',
      header: text.columnHeaders.order,
      numeric: true,
      cell: (row) => subjects.indexOf(row) + 1,
    },
    { key: 'subject', header: text.columnHeaders.subject, cell: (row) => row.name },
    {
      key: 'type',
      header: text.columnHeaders.gradingType,
      cell: (row) => text.gradingTypes[row.grading_type],
    },
    {
      key: 'max',
      header: text.columnHeaders.max,
      numeric: true,
      cell: (row) => row.max_score ?? shell.common.none,
    },
    {
      key: 'pass',
      header: text.columnHeaders.pass,
      numeric: true,
      cell: (row) => row.pass_score ?? shell.common.none,
    },
  ]

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
        <CardHeader title={text.chooseTitle} />
        <CardBody className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <TermField
              value={termId}
              onChange={setTermId}
              placeholder={shell.pickers.pickTerm}
              required
            />
            <GradeField
              value={gradeId}
              onChange={setGradeId}
              placeholder={shell.pickers.pickGrade}
              required
            />
          </div>

          <div className="flex flex-col gap-3 rounded-control border border-line border-s-2 border-s-accent bg-sunken px-4 py-3">
            <p className="flex items-center gap-2 text-h2 font-semibold text-ink">
              <Icon name="info" className="size-4 text-accent" />
              {text.howTitle}
            </p>
            <ol className="flex list-inside list-decimal flex-col gap-1.5 text-small text-muted">
              {text.howSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              disabled={!chosen || !roster.data}
              loading={chosen && roster.isPending}
              onClick={download}
            >
              <Icon name="download" />
              {text.download}
            </Button>
            {!chosen ? (
              <span className="text-small text-muted">{text.pickBoth}</span>
            ) : roster.isPending ? (
              <span className="flex items-center gap-2 text-small text-muted">
                <Spinner className="text-accent" label={text.downloadingRoster} />
                {text.downloadingRoster}
              </span>
            ) : roster.data ? (
              <span className="text-small text-muted">
                {roster.data.students.length === 0
                  ? text.rosterEmpty
                  : text.studentCount(roster.data.students.length)}
              </span>
            ) : null}
          </div>

          {roster.isError ? (
            <ErrorState error={roster.error} onRetry={() => void roster.refetch()} labels={shell.error} />
          ) : null}

          {subjects.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-h2 font-semibold text-ink">{text.columnsTitle}</h3>
                <p className="max-w-prose text-small text-muted">{text.columnsHint}</p>
              </div>
              <DataTable
                caption={text.columnsTitle}
                columns={subjectColumns}
                rows={subjects}
                rowKey={(row) => row.id}
              />
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={text.uploadTitle} />
        <CardBody className="flex flex-col gap-4">
          <p className="max-w-prose text-small text-muted">{text.uploadHint}</p>

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
              disabled={!chosen || file === null}
              onClick={submit}
            >
              <Icon name="upload" />
              {text.upload}
            </Button>
          </div>
        </CardBody>
      </Card>

      {report ? <ImportReportPanel report={report} onStartOver={resetUpload} /> : null}

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
