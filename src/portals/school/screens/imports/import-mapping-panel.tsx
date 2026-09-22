import { useMemo } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { Field } from '~/ui/field'
import { Select } from '~/ui/select'
import { Stamp } from '~/ui/stamp'
import type { ImportPreview, ImportPreviewSubject, Subject } from '../../api/types'
import { importsText } from './imports.i18n'

export type MappingChoice = Record<number, string>

type MappingPanelProps = {
  preview: ImportPreview
  subjects: readonly Subject[]
  mapping: MappingChoice
  onChange: (sheetIndex: number, subjectId: string) => void
  onConfirm: () => void
  onBack: () => void
  confirming: boolean
}

function subjectIdOf(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function ColumnList({ columns }: { columns: Record<string, string> }) {
  const entries = Object.entries(columns)
  if (entries.length === 0) return <span className="text-muted">—</span>
  return (
    <span className="font-mono text-small text-muted" dir="ltr">
      {entries.map(([letter, label]) => `${letter}:${label}`).join(' · ')}
    </span>
  )
}

function PreviewSample({ rows }: { rows: Record<string, string>[] }) {
  const text = useDict(importsText)
  if (rows.length === 0) return null

  const letters = Object.keys(rows[0] ?? {})
  const sample = rows.slice(0, 5)

  return (
    <Card>
      <CardHeader title={text.previewRowsTitle} />
      <CardBody className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-small">
          <thead>
            <tr className="border-b border-line text-start">
              {letters.map((letter) => (
                <th key={letter} className="px-2 py-1 font-mono font-semibold text-muted" dir="ltr">
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sample.map((row, index) => (
              <tr key={index} className="border-b border-line/60">
                {letters.map((letter) => (
                  <td key={letter} className="max-w-40 truncate px-2 py-1.5 text-ink" title={row[letter]}>
                    {row[letter] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  )
}

function SubjectRow({
  entry,
  subjects,
  value,
  onChange,
}: {
  entry: ImportPreviewSubject
  subjects: readonly Subject[]
  value: string
  onChange: (subjectId: string) => void
}) {
  const text = useDict(importsText)

  const options = useMemo(
    () =>
      subjects
        .filter((subject) => subject.grading_type === entry.gradingType)
        .map((subject) => ({
          value: String(subject.id),
          label: subject.code ? `${subject.code} — ${subject.name}` : subject.name,
        })),
    [subjects, entry.gradingType],
  )

  const unmatched = entry.suggestedSubjectId == null
  const gradingTone = entry.gradingType === 'qualitative' ? 'info' : 'neutral'

  return (
    <div className="flex flex-col gap-3 rounded-control border border-line bg-sunken/40 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="label-micro">{text.sheetSubject}</span>
          <span className="text-body font-semibold text-ink">{entry.sheetName}</span>
        </div>
        <Stamp tone={gradingTone}>{text.gradingTypes[entry.gradingType]}</Stamp>
        {unmatched ? <Stamp tone="attention">{text.unmatched}</Stamp> : null}
      </div>

      <div className="grid gap-1 text-small">
        <span className="label-micro">{text.columns}</span>
        <ColumnList columns={entry.columns} />
      </div>

      <Field label={text.mapTo}>
        {(props) => (
          <Select
            {...props}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            options={options}
            placeholder={options.length === 0 ? text.noSubjectsForType : text.skip}
            disabled={options.length === 0}
          />
        )}
      </Field>
    </div>
  )
}

/**
 * Always shown after preview — even when every suggestion looks correct.
 * Layout can change between uploads from the same school.
 */
export function ImportMappingPanel({
  preview,
  subjects,
  mapping,
  onChange,
  onConfirm,
  onBack,
  confirming,
}: MappingPanelProps) {
  const text = useDict(importsText)
  const mappedCount = Object.values(mapping).filter((id) => id !== '').length

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title={text.mappingTitle} />
        <CardBody className="flex flex-col gap-4">
          <p className="text-small text-muted">{text.mappingHint}</p>

          {preview.sheet.trim() !== '' ? (
            <p className="text-small text-ink">
              <span className="label-micro me-2">{text.sheetLabel}</span>
              {preview.sheet.trim()}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            {preview.subjects.map((entry) => (
              <SubjectRow
                key={entry.sheetIndex}
                entry={entry}
                subjects={subjects}
                value={mapping[entry.sheetIndex] ?? ''}
                onChange={(subjectId) => onChange(entry.sheetIndex, subjectId)}
              />
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={onBack} disabled={confirming}>
              {text.back}
            </Button>
            <Button
              variant="primary"
              loading={confirming}
              disabled={mappedCount === 0 || confirming}
              onClick={onConfirm}
            >
              {text.confirm}
            </Button>
          </div>
        </CardBody>
      </Card>

      <PreviewSample rows={preview.previewRows} />
    </div>
  )
}

/** Seed selects from the backend’s name-based suggestions. */
export function initialMapping(preview: ImportPreview): MappingChoice {
  const next: MappingChoice = {}
  for (const entry of preview.subjects) {
    next[entry.sheetIndex] = subjectIdOf(entry.suggestedSubjectId)
  }
  return next
}
