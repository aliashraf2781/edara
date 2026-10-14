import { useMemo, useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { Checkbox } from '~/ui/checkbox'
import { Icon } from '~/ui/icon'
import { Select } from '~/ui/select'
import { Stamp } from '~/ui/stamp'
import { cn } from '~/ui/cn'
import { useSubjects } from '../../api/use-options'
import type { ImportMappingEntry, ImportPreview, ImportPreviewSubject } from '../../api/types'
import { importsText } from './imports.i18n'

type Row = {
  subjectId: string
  /** Explicit skip. An untouched needs_review row is NOT skipped, it is unresolved. */
  skipped: boolean
  /** null = follow the global "remember" checkbox. */
  save: boolean | null
}

const initialRow = (subject: ImportPreviewSubject): Row => ({
  subjectId: subject.status === 'matched' ? (subject.suggestedSubjectId ?? '') : '',
  skipped: false,
  save: null,
})

export function ImportMappingStep({
  preview,
  gradeId,
  pending,
  onConfirm,
  onCancel,
}: {
  preview: ImportPreview
  gradeId?: string
  pending: boolean
  onConfirm: (mapping: ImportMappingEntry[]) => void
  onCancel: () => void
}) {
  const text = useDict(importsText)
  const t = text.mapping
  const subjects = useSubjects(gradeId || undefined)
  const [rows, setRows] = useState<Record<number, Row>>(() =>
    Object.fromEntries(preview.subjects.map((s) => [s.sheetIndex, initialRow(s)])),
  )
  const [rememberAll, setRememberAll] = useState(true)

  const options = useMemo(() => {
    const byId = new Map<string, string>()
    for (const s of subjects.data ?? []) byId.set(String(s.id), s.name)
    for (const s of preview.subjects) {
      if (s.suggestedSubjectId && !byId.has(s.suggestedSubjectId))
        byId.set(s.suggestedSubjectId, s.suggestedSubjectName ?? s.suggestedSubjectId)
      for (const c of s.candidates) if (!byId.has(c.subjectId)) byId.set(c.subjectId, c.subjectName)
    }
    return [...byId].map(([value, label]) => ({ value, label }))
  }, [subjects.data, preview.subjects])
  const nameOf = (id: string) => options.find((o) => o.value === id)?.label ?? id

  const patch = (index: number, change: Partial<Row>) =>
    setRows((current) => ({ ...current, [index]: { ...current[index], ...change } }))

  const active = preview.subjects.filter((s) => !rows[s.sheetIndex].skipped)
  const unresolved = active.filter((s) => rows[s.sheetIndex].subjectId === '').length
  const usage = new Map<string, number>()
  for (const s of active) {
    const id = rows[s.sheetIndex].subjectId
    if (id) usage.set(id, (usage.get(id) ?? 0) + 1)
  }
  const duplicates = [...usage].filter(([, n]) => n > 1).map(([id]) => id)
  const blocked = unresolved > 0 || duplicates.length > 0

  const submit = () => {
    if (blocked || pending) return
    onConfirm(
      active.map((s) => ({
        sheet_index: s.sheetIndex,
        subject_id: rows[s.sheetIndex].subjectId,
        save_alias: rows[s.sheetIndex].save ?? rememberAll,
      })),
    )
  }

  return (
    <Card>
      <CardHeader title={t.title} />
      <CardBody className="flex flex-col gap-4">
        <p className="max-w-prose text-small text-muted">{t.description}</p>
        <Checkbox
          label={t.remember}
          checked={rememberAll}
          onChange={(event) => setRememberAll(event.target.checked)}
        />

        <ul className="flex flex-col gap-3">
          {preview.subjects.map((s) => {
            const row = rows[s.sheetIndex]
            const review = s.status === 'needs_review'
            const duplicate = !row.skipped && row.subjectId !== '' && duplicates.includes(row.subjectId)
            return (
              <li
                key={s.sheetIndex}
                className={cn(
                  'flex flex-col gap-3 rounded-control border border-line border-s-2 px-4 py-3',
                  row.skipped ? 'border-s-line bg-sunken opacity-80' : review ? 'border-s-attention' : 'border-s-success',
                  duplicate && 'border-s-danger',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="label-micro">{t.sheetColumn}</span>
                  <span className="font-semibold text-ink">{s.sheetName}</span>
                  <Stamp tone={review ? 'attention' : 'success'}>{review ? t.needsReview : t.matched}</Stamp>
                  {row.skipped ? <Stamp tone="neutral">{t.skipped}</Stamp> : null}
                </div>

                {row.skipped ? null : (
                  <>
                    {s.candidates.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.suggestions}>
                        <span className="text-small text-muted">{t.suggestions}</span>
                        {s.candidates.map((c) => (
                          <Button
                            key={c.subjectId}
                            variant={row.subjectId === c.subjectId ? 'primary' : 'secondary'}
                            aria-pressed={row.subjectId === c.subjectId}
                            onClick={() => patch(s.sheetIndex, { subjectId: c.subjectId })}
                          >
                            {c.subjectName} · {Math.round(c.score * 100)}%
                          </Button>
                        ))}
                      </div>
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Select
                        aria-label={`${t.subject}: ${s.sheetName}`}
                        aria-invalid={row.subjectId === '' || duplicate}
                        value={row.subjectId}
                        placeholder={t.pickSubject}
                        options={options}
                        onChange={(event) => patch(s.sheetIndex, { subjectId: event.target.value })}
                      />
                      {row.subjectId !== '' ? (
                        <Checkbox
                          label={t.remember}
                          checked={row.save ?? rememberAll}
                          onChange={(event) => patch(s.sheetIndex, { save: event.target.checked })}
                        />
                      ) : null}
                    </div>
                    {duplicate ? (
                      <p className="flex items-center gap-2 text-small text-danger">
                        <Icon name="alert" className="size-4" />
                        {t.duplicate(nameOf(row.subjectId))}
                      </p>
                    ) : null}
                  </>
                )}

                <div>
                  <Button variant="ghost" onClick={() => patch(s.sheetIndex, { skipped: !row.skipped })}>
                    {row.skipped ? t.undoSkip : t.skipColumn}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>

        {unresolved > 0 ? (
          <p className="flex items-center gap-2 text-small text-attention">
            <Icon name="alert" className="size-4" />
            {t.unresolved(unresolved)}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button onClick={onCancel} disabled={pending}>
            {t.cancel}
          </Button>
          <Button variant="primary" loading={pending} disabled={blocked || pending} onClick={submit}>
            {pending ? t.confirming : t.confirm}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
