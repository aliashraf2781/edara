import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DataTable, type Column } from '~/ui/data-table'
import { Icon } from '~/ui/icon'
import { Stamp } from '~/ui/stamp'
import { cn } from '~/ui/cn'
import type { ImportReport, ImportRowError } from '../../api/types'
import { importsText } from './imports.i18n'

function StatTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-control border border-line bg-sunken px-4 py-3">
      <span className="label-micro">{label}</span>
      <span className="font-mono text-h1 text-ink">{value ?? '—'}</span>
    </div>
  )
}

/**
 * Uploads are per-cell, not all-or-nothing. The headline counts students; the
 * recorded tile counts individual subject marks.
 */
export function ImportReportPanel({
  report,
  onStartOver,
  gradeName,
  detectedTermName,
  timedOut = false,
}: {
  report: ImportReport
  onStartOver?: () => void
  /** The grade this import went to. */
  gradeName?: string | null
  /** Set when the backend read the term off the sheet itself, not an explicit param. */
  detectedTermName?: string | null
  /** Polling gave up while the import was still processing. */
  timedOut?: boolean
}) {
  const text = useDict(importsText)
  const [expanded, setExpanded] = useState<number | null>(null)

  // The backend now processes an import's sheets on a queue worker (see
  // useImportReport's docblock) — this panel can render while the counts
  // are still zeroed because nothing has been written yet, not because the
  // sheet was actually empty. Treating that as "clean" would show a
  // misleading green "no errors" banner before the import has even run.
  const processing = report.status === 'processing' || report.status === 'previewing'
  const failed = report.status === 'failed'
  const rolledBack = report.status === 'rolled_back'
  const finished = !processing
  const clean = finished && !failed && !rolledBack && report.invalid_rows === 0

  const columns: readonly Column<ImportRowError>[] = [
    { key: 'row', header: text.errorColumns.row, numeric: true, cell: (row) => row.row_number },
    {
      key: 'code',
      header: text.errorColumns.code,
      cell: (row) => <Stamp tone="danger">{text.errorLabels[row.error_code] ?? row.error_code}</Stamp>,
    },
    { key: 'message', header: text.errorColumns.message, cell: (row) => row.error_message },
    {
      key: 'payload',
      header: text.errorColumns.payload,
      cell: (row) => (
        <div className="flex flex-col items-start gap-2">
          <Button
            variant="ghost"
            onClick={() => setExpanded(expanded === row.row_number ? null : row.row_number)}
            aria-expanded={expanded === row.row_number}
          >
            {expanded === row.row_number ? text.hidePayload : text.showPayload}
          </Button>
          {expanded === row.row_number ? (
            <pre
              className="max-w-md overflow-x-auto rounded-control border border-line bg-sunken p-3 font-mono text-small text-muted"
              dir="ltr"
            >
              {JSON.stringify(row.row_payload, null, 2)}
            </pre>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title={text.summaryTitle}
          action={onStartOver ? <Button onClick={onStartOver}>{text.startOver}</Button> : undefined}
        />
        <CardBody className="flex flex-col gap-4">
          <p
            className={cn(
              'flex items-start gap-2 rounded-control border border-s-2 px-4 py-3 text-body',
              processing && !timedOut
                ? 'border-accent/30 border-s-accent bg-accent/8 text-accent'
                : clean
                  ? 'border-success/30 border-s-success bg-success/8 text-success'
                  : 'border-attention/30 border-s-attention bg-attention/8 text-attention',
            )}
          >
            <Icon name={processing && !timedOut ? 'clock' : clean ? 'check' : 'alert'} className="size-4 shrink-0" />
            <span>
              {processing
                ? timedOut
                  ? text.stalledBanner
                  : text.processingBanner
                : failed
                  ? text.failedBanner
                  : rolledBack
                    ? text.rolledBackBanner
                    : clean
                  ? text.successBanner(report.valid_rows, report.imported_rows)
                  : text.partialBanner(report.valid_rows, report.total_rows, report.invalid_rows)}
            </span>
          </p>

          {processing || failed || rolledBack ? null : <p className="text-small text-muted">{text.importedResultsHint(report.imported_rows)}</p>}

          {finished && !failed && report.studentsCreated > 0 ? (
            <p className="flex items-center gap-2 text-small text-muted">
              <Icon name="info" className="size-4 text-accent" />
              {text.studentsCreatedHint(report.studentsCreated)}
            </p>
          ) : null}

          {gradeName ? (
            <p className="flex items-center gap-2 text-small text-muted">
              <Icon name="info" className="size-4 text-accent" />
              {text.gradeLine(gradeName, report.gradeDetectedFromSheet)}
            </p>
          ) : null}

          {detectedTermName ? (
            <p className="flex items-center gap-2 text-small text-muted">
              <Icon name="info" className="size-4 text-accent" />
              {text.detectedFromSheet(null, detectedTermName)}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label={text.stats.total} value={finished ? report.total_rows : null} />
            <StatTile label={text.stats.valid} value={finished ? report.valid_rows : null} />
            <StatTile label={text.stats.invalid} value={finished ? report.invalid_rows : null} />
            <StatTile label={text.stats.imported} value={finished ? report.imported_rows : null} />
          </div>
        </CardBody>
      </Card>

      {processing || (clean && report.errors.length === 0) ? null : (
        <div className="flex flex-col gap-3">
          <h2 className="text-h1 font-semibold text-ink">{text.errorsTitle}</h2>
          <DataTable
            caption={text.errorsTitle}
            columns={columns}
            rows={report.errors}
            rowKey={(row) => String(row.row_number)}
            tall
          />
        </div>
      )}
    </div>
  )
}
