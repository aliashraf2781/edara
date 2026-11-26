import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import { Select } from '~/ui/select'
import { Icon } from '~/ui/icon'
import { Stamp } from '~/ui/stamp'
import { PageHeader } from '~/ui/page-header'
import { ProgressBar, Spinner } from '~/ui/spinner'
import { useToast } from '~/ui/toast'
import {
  IMPORT_EXTENSIONS,
  IMPORT_MAX_BYTES,
  readTermRequest,
  type TermRequest,
  useImportHistory,
  useImportReport,
  isImportPending,
  isImportStalled,
  useTermCheck,
  useUploadResults,
} from '../../api/imports'
import { useAcademicList } from '../../api/academics'
import { useAllExamPeriods } from '../../api/exam-periods'
import { schoolKeys } from '../../api/keys'
import type { AcademicYear, ImportReport } from '../../api/types'
import { useCurrentYearTerms, useCurriculumNames, yearLabel } from '../../api/use-options'
import { AcademicYearField, GradeField } from '../../components/term-grade-fields'
import { schoolText } from '../../school.i18n'
import { ImportReportPanel } from './import-report-panel'
import { importsText } from './imports.i18n'

const MAX_MB = IMPORT_MAX_BYTES / 1024 / 1024

const count = (row: ImportReport, value: number) =>
  row.status === 'completed' || row.status === 'failed' ? value : '—'

function StatusBadge({ row }: { row: ImportReport }) {
  const text = useDict(importsText)
  if (isImportPending(row.status)) {
    return isImportStalled(row) ? (
      <Stamp tone="attention">{text.statusStalled}</Stamp>
    ) : (
      <span className="inline-flex items-center gap-2 text-small text-accent">
        <Spinner className="size-4" />
        {text.statusProcessing}
      </span>
    )
  }
  const tone = row.status === 'completed' ? 'success' : row.status === 'failed' ? 'danger' : 'attention'
  return <Stamp tone={tone}>{text.statusLabels[row.status] ?? row.status}</Stamp>
}

export function ImportsScreen() {
  const text = useDict(importsText)
  const shell = useDict(schoolText)
  const v = useDict(validationText)
  const { locale } = useLocale()
  const { notify, notifyError } = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const { termName, gradeName } = useCurriculumNames()

  const [file, setFile] = useState<File | null>(null)
  // Just the id — the report itself is read live via useImportReport below,
  // which polls while the backend's queue worker is still processing this
  // import's sheets (see that hook's docblock). Keeping only the id here
  // means the panel always reflects the latest fetched state instead of the
  // upload response's initial, still-zeroed snapshot.
  const [reportId, setReportId] = useState<string | null>(null)
  // Set only after a 422 asks for one explicitly — most sheets never need
  // these, so they stay hidden until the backend says it can't detect one.
  const [needsGrade, setNeedsGrade] = useState(false)
  // Set when the server could not read the term off the sheet and no term was
  // sent: its sentence and the terms it offers replace the picker's defaults.
  const [termRequest, setTermRequest] = useState<TermRequest | null>(null)
  const [needsAcademicYear, setNeedsAcademicYear] = useState(false)
  const [gradeId, setGradeId] = useState('')
  const [termId, setTermId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')

  const queryClient = useQueryClient()
  const history = useImportHistory()
  const upload = useUploadResults()
  const terms = useAllExamPeriods()
  const years = useAcademicList<AcademicYear>('academic-years', {})
  const { year: currentYear, options: schoolTermOptions } = useCurrentYearTerms()
  const liveReport = useImportReport(reportId ?? '')
  const report = liveReport.data ?? null

  // The same file (by name) already uploaded: point at that import instead of
  // queuing another batch. A failed or rolled-back import may be retried.
  const earlier =
    file === null
      ? undefined
      : (history.data?.data ?? []).find(
          (row) => row.file_name === file.name && row.status !== 'failed' && row.status !== 'rolled_back',
        )

  // The server's own list wins once it has spoken (it can name terms the
  // cached list has not caught up with); otherwise the school's terms.
  const termOptions = useMemo(
    () =>
      termRequest && termRequest.availableTerms.length > 0
        ? (() => {
            const fromServer = termRequest.availableTerms.map((term) => ({ value: term.id, label: term.name }))
            // Prefer the current year's terms among the ones the server offers.
            const inCurrentYear = fromServer.filter((option) =>
              schoolTermOptions.some((mine) => mine.value === option.value),
            )
            return inCurrentYear.length > 0 ? inCurrentYear : fromServer
          })()
        : schoolTermOptions,
    [termRequest, schoolTermOptions],
  )
  // The preview needs the picked term's academic year, which only the
  // school's own exam periods carry (the server's fallback list has no year).
  const pickedTerm = (terms.data ?? []).find((term) => term.id === termId)
  const termCheck = useTermCheck(
    file,
    pickedTerm ? { id: pickedTerm.id, academicYearId: pickedTerm.academic_year_id } : null,
  )
  const check = termCheck.data ?? null
  // The term the sheet names, as one of the school's own picks.
  const detectedTerm =
    check?.status === 'mismatch'
      ? check.availableTerms.find((term) => term.term !== null && term.term === check.detected?.term)
      : undefined

  // A term is always sent when there is anything to pick from. While the list
  // is still loading the button waits; if it failed to load, the upload is
  // not blocked and the server's 422 becomes the way to pick one.
  const termRequired = termRequest !== null ? termOptions.length > 0 : terms.isPending || termOptions.length > 0

  useEffect(() => {
    // The upload response's grade/subject/classroom auto-creates only
    // exist once the queue worker actually finishes writing them — picker
    // caches invalidated right after upload (see useUploadResults) are
    // stale until then. Re-invalidating the moment this import leaves
    // "processing" is what makes a freshly-created grade show up in the
    // grade filter without a manual refresh.
    if (report && report.status !== 'processing') {
      void queryClient.invalidateQueries({ queryKey: schoolKeys.all })
    }
  }, [report?.status, queryClient])

  // The sheet named no year and the school has none marked current, so the
  // server asked for one. Until the operator picks, the school's current year
  // (or its only year) is the selection, so they can just press upload again.
  const yearList = years.data ?? []
  const defaultYearId = (yearList.find((year) => year.is_current) ?? (yearList.length === 1 ? yearList[0] : undefined))?.id ?? ''
  const effectiveYearId = academicYearId !== '' ? academicYearId : needsAcademicYear ? defaultYearId : ''

  const resetUpload = () => {
    setReportId(null)
    setFile(null)
    setNeedsGrade(false)
    setTermRequest(null)
    setNeedsAcademicYear(false)
    setGradeId('')
    setTermId('')
    setAcademicYearId('')
    if (fileInput.current) fileInput.current.value = ''
    upload.reset()
  }

  const submit = async () => {
    if (!file) return notify('danger', text.noFile)
    if (earlier) return notify('danger', text.alreadyUploaded)
    if (file.size > IMPORT_MAX_BYTES) return notify('danger', v.fileTooLarge(MAX_MB))

    try {
      const response = await upload.mutateAsync({
        file,
        gradeId: gradeId || undefined,
        termId: termId || undefined,
        academicYearId: effectiveYearId || undefined,
      })
      setReportId(String(response.id))
      // Every file is its own upload: nothing picked for this one (grade,
      // term, year, file) may leak into the next.
      setFile(null)
      setGradeId('')
      setTermId('')
      setAcademicYearId('')
      if (fileInput.current) fileInput.current.value = ''
      setNeedsGrade(false)
      setTermRequest(null)
      setNeedsAcademicYear(false)
    } catch (error) {
      // A sheet with no detectable grade/term (grades 1-2 never split
      // results by term at all) or no "العام الدراسى ..." metadata line —
      // reveal the matching picker instead of just showing the error, so
      // the operator can retry immediately.
      const request = readTermRequest(error)
      if (isValidationError(error)) {
        if (error.fieldErrors.grade_id) setNeedsGrade(true)
        if (error.fieldErrors.academic_year_id) setNeedsAcademicYear(true)
      }
      if (request) {
        setTermRequest(request)
        // A pick the server's list does not contain would show as an empty
        // select while still being held in state and resent.
        if (request.availableTerms.length > 0 && !request.availableTerms.some((term) => term.id === termId)) {
          setTermId('')
        }
        // The panel carries the server's sentence; a toast saying "The given
        // data was invalid." on top of it would only repeat noise.
        if (!(isValidationError(error) && Object.keys(error.fieldErrors).some((key) => key !== 'term_id'))) return
      }
      notifyError(error, shell.error.title)
    }
  }

  const named = (name: string, id: string) => (
    <span title={`#${id}`} className={name === id ? 'text-muted' : undefined}>
      {name === id ? '—' : name}
    </span>
  )
  const historyColumns: readonly Column<ImportReport>[] = [
    { key: 'file', header: text.historyColumns.file, cell: (row) => row.file_name },
    { key: 'grade', header: text.historyColumns.grade, cell: (row) => named(gradeName(row.grade_id), row.grade_id) },
    { key: 'term', header: text.historyColumns.term, cell: (row) => named(termName(row.term_id), row.term_id) },
    { key: 'status', header: text.historyColumns.status, cell: (row) => <StatusBadge row={row} /> },
    // Zeros only mean something once the import has finished.
    { key: 'students', header: text.historyColumns.students, numeric: true, cell: (row) => count(row, row.total_rows) },
    { key: 'imported', header: text.historyColumns.imported, numeric: true, cell: (row) => count(row, row.imported_rows) },
    { key: 'errors', header: text.historyColumns.errors, numeric: true, cell: (row) => count(row, row.invalid_rows) },
    {
      key: 'date',
      header: text.historyColumns.date,
      cell: (row) => <span dir="auto">{formatDateTime(row.created_at, locale)}</span>,
    },
    {
      key: 'open',
      header: text.historyColumns.details,
      cell: (row) => (
        <Button variant="ghost" onClick={() => setReportId(String(row.id))}>
          {text.view} #{row.id}
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      <Card>
        <CardHeader title={text.uploadTitle} />
        <CardBody className="flex flex-col gap-4">
          <p className="max-w-prose text-small text-muted">{text.uploadHint}</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-md">
            <Field
              label={shell.pickers.term}
              hint={currentYear ? text.currentYear(yearLabel(currentYear)) : text.termHint}
              required={termRequired}
            >
              {(props) => (
                <Select
                  {...props}
                  value={termId}
                  onChange={(event) => setTermId(event.target.value)}
                  options={termOptions}
                  // A real empty slot, so an unpicked term never looks picked.
                  placeholder={shell.pickers.pickTerm}
                  disabled={upload.isPending}
                />
              )}
            </Field>
          </div>

          {file !== null && pickedTerm ? (
            termCheck.isFetching ? (
              <p className="text-small text-muted" aria-live="polite">
                {text.termChecking}
              </p>
            ) : check?.status === 'match' ? (
              <p className="flex items-center gap-2 text-small text-success" aria-live="polite">
                <Icon name="check" className="size-4 shrink-0" />
                {text.termMatch}
              </p>
            ) : check?.status === 'mismatch' ? (
              <div
                role="alert"
                className="flex flex-col gap-2 rounded-control border border-line border-s-2 border-s-attention bg-sunken px-4 py-3 text-small text-attention"
              >
                <p className="flex items-start gap-2">
                  <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
                  <span>{check.message ?? text.termMismatch(check.detected?.name ?? '')}</span>
                </p>
                <p className="text-muted">{text.termKeep}</p>
                {detectedTerm && terms.data?.some((term) => term.id === detectedTerm.id) ? (
                  <div className="flex justify-start">
                    <Button onClick={() => setTermId(detectedTerm.id)}>{text.termSwitch(detectedTerm.name)}</Button>
                  </div>
                ) : null}
              </div>
            ) : check?.status === 'unverified' ? (
              <p className="text-small text-muted">{text.termUnverified}</p>
            ) : null
          ) : null}

          {terms.isError && termRequest === null ? (
            <p className="flex items-center gap-2 text-small text-attention">
              <Icon name="alert" className="size-4 shrink-0" />
              {text.termLoadFailed}
            </p>
          ) : null}

          {termRequest && termId === '' ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-control border border-line border-s-2 border-s-attention bg-sunken px-4 py-3 text-small text-attention"
            >
              <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
              <span>{termOptions.length === 0 ? text.termNoOptions : (termRequest.message ?? text.termUnclear)}</span>
            </p>
          ) : null}

          {needsGrade || needsAcademicYear ? (
            <div className="flex flex-col gap-3 rounded-control border border-line border-s-2 border-s-attention bg-sunken px-4 py-3">
              <p className="flex items-center gap-2 text-small text-attention">
                <Icon name="alert" className="size-4" />
                {needsAcademicYear && !needsGrade ? text.yearDetectionFailed : text.detectionFailed}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:max-w-md">
                {needsAcademicYear ? (
                  <AcademicYearField
                    value={effectiveYearId}
                    onChange={setAcademicYearId}
                    placeholder={shell.pickers.pickYear}
                    required
                  />
                ) : null}
                {needsGrade ? (
                  <GradeField value={gradeId} onChange={setGradeId} placeholder={shell.pickers.pickGrade} required />
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

          {earlier ? (
            <p
              role="alert"
              className="flex flex-wrap items-center gap-2 rounded-control border border-line border-s-2 border-s-attention bg-sunken px-4 py-3 text-small text-attention"
            >
              <Icon name="alert" className="size-4 shrink-0" />
              <span>{text.alreadyUploaded}</span>
              <Button variant="ghost" onClick={() => setReportId(String(earlier.id))}>
                {text.view} #{earlier.id}
              </Button>
            </p>
          ) : null}

          {file !== null && termId !== '' ? (
            <p className="rounded-control border border-line bg-sunken px-4 py-3 text-small text-ink" aria-live="polite">
              {text.uploadSummary(
                file.name,
                termOptions.find((option) => option.value === termId)?.label ?? '',
                pickedTerm && currentYear && pickedTerm.academic_year_id === currentYear.id
                  ? yearLabel(currentYear)
                  : null,
              )}
            </p>
          ) : null}

          {upload.isPending ? <ProgressBar label={text.uploading} /> : null}

          <div className="flex justify-end">
            <Button
              variant="primary"
              loading={upload.isPending}
              disabled={
                file === null ||
                upload.isPending ||
                earlier !== undefined ||
                (needsGrade && gradeId === '') ||
                (termRequired && termId === '') ||
                (needsAcademicYear && effectiveYearId === '')
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
          gradeName={gradeName(report.grade_id)}
          detectedTermName={report.termDetectedFromSheet ? termName(report.term_id) : null}
          timedOut={liveReport.timedOut}
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
