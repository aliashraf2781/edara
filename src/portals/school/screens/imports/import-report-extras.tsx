import { useState } from 'react'
import { Link } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { ConfirmDialog } from '~/ui/dialog'
import { Icon } from '~/ui/icon'
import { Stamp, type StampTone } from '~/ui/stamp'
import { useToast } from '~/ui/toast'
import { useRollbackImport } from '../../api/imports'
import type { ImportReport } from '../../api/types'
import { useSchoolSession } from '../../auth/session-context'
import { importsText } from './imports.i18n'

const TONES: Record<string, StampTone> = {
  previewing: 'info',
  processing: 'info',
  completed: 'success',
  failed: 'danger',
  rolled_back: 'attention',
}

/** Unknown server statuses fall back to the raw string on a neutral stamp. */
export function ImportStatusBadge({ status }: { status: string }) {
  const text = useDict(importsText)
  return <Stamp tone={TONES[status] ?? 'neutral'}>{text.statusLabels[status] ?? status}</Stamp>
}

export function ImportSubjectNotes({ report }: { report: ImportReport }) {
  const text = useDict(importsText).subjectNotes
  const created = report.subjectNotes.filter((n) => n.action === 'created')
  const similar = report.subjectNotes.filter((n) => n.action === 'matched_similar')
  if (created.length === 0 && similar.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {created.length > 0 ? (
        <p className="flex flex-wrap items-center gap-2 rounded-control border border-attention/30 border-s-2 border-s-attention bg-attention/8 px-4 py-3 text-body text-attention">
          <Icon name="alert" className="size-4 shrink-0" />
          <span>{text.created(created.length, created.map((n) => n.subject).join('، '))}</span>
          <Link to="/school/academics" className="font-semibold underline">
            {text.viewSubjects}
          </Link>
        </p>
      ) : null}
      {similar.map((n, index) => (
        <p key={`${n.sheetName}-${index}`} className="flex items-center gap-2 text-small text-muted">
          <Icon name="info" className="size-4 text-accent" />
          {text.similar(
            n.sheetName,
            n.subject,
            typeof n.score === 'number' ? Math.round(n.score > 1 ? n.score : n.score * 100) : null,
          )}
        </p>
      ))}
    </div>
  )
}

/** Rendered only for admins on completed/failed imports; hidden otherwise. */
export function RollbackAction({ report }: { report: ImportReport }) {
  const text = useDict(importsText)
  const { can } = useSchoolSession()
  const { notify, notifyError } = useToast()
  const rollback = useRollbackImport()
  const [open, setOpen] = useState(false)

  if (!can.isAdmin || (report.status !== 'completed' && report.status !== 'failed')) return null

  const run = async () => {
    if (rollback.isPending) return
    try {
      await rollback.mutateAsync(String(report.id))
      setOpen(false)
      notify('success', text.rollback.done)
    } catch (error) {
      // A 422 carries the server's own explanation, shown as is.
      setOpen(false)
      notifyError(error, text.rollback.title)
    }
  }

  return (
    <>
      <Button destructive onClick={() => setOpen(true)} disabled={rollback.isPending}>
        {text.rollback.action}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => void run()}
        title={text.rollback.title}
        consequence={text.rollback.consequence(report.imported_rows)}
        confirmLabel={text.rollback.confirm}
        cancelLabel={text.rollback.cancel}
        destructive
        loading={rollback.isPending}
      />
    </>
  )
}
