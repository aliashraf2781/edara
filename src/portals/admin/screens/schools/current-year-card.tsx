import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { ConfirmDialog } from '~/ui/dialog'
import { Select } from '~/ui/select'
import { Stamp } from '~/ui/stamp'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { useCurrentYear, useSetCurrentYear } from '../../api/academic-year'
import { PERMISSION } from '../../api/permissions'
import { useAdminSession } from '../../auth/session-context'
import { currentYearText } from './current-year.i18n'

/** The current year and the four years around it, as "2025/2026". */
const yearChoices = (current: string): string[] => {
  const start = Number(current.slice(0, 4))
  if (!Number.isFinite(start)) return [current]
  return [start - 1, start, start + 1, start + 2].map((year) => `${year}/${year + 1}`)
}

export function CurrentYearCard() {
  const text = useDict(currentYearText)
  const shell = useDict(adminText)
  const { can, isGlobalAdmin } = useAdminSession()
  const { notify, notifyError } = useToast()
  const query = useCurrentYear(can(PERMISSION.viewTenants))
  const setYear = useSetCurrentYear()
  const [picked, setPicked] = useState('')
  const [confirming, setConfirming] = useState(false)

  if (query.isError) {
    return (
      <Card>
        <CardBody>
          <p className="text-small text-attention">{text.loadFailed}</p>
        </CardBody>
      </Card>
    )
  }

  const data = query.data
  const choice = picked !== '' ? picked : (data?.current ?? '')
  const changed = data !== undefined && choice !== data.current
  const needsSync = data !== undefined && data.schoolsInSync < data.schools

  const apply = async () => {
    try {
      await setYear.mutateAsync(choice)
      notify('success', text.updated(choice))
      setPicked('')
      setConfirming(false)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  return (
    <Card>
      <CardHeader title={text.title} />
      <CardBody className="flex flex-col gap-4">
        <p className="max-w-prose text-small text-muted">{text.description}</p>

        <div className="flex flex-wrap items-center gap-3">
          <Stamp tone="success">{text.current}</Stamp>
          <span className="text-h2 font-semibold text-ink" dir="ltr">
            {data?.current ?? '…'}
          </span>
          {data ? <span className="text-small text-muted">{text.schools(data.schoolsInSync, data.schools)}</span> : null}
        </div>

        {needsSync && !changed ? <p className="text-small text-attention">{text.notInSync}</p> : null}

        {isGlobalAdmin && data ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-48" dir="ltr">
              <Select
                aria-label={text.pick}
                value={choice}
                onChange={(event) => setPicked(event.target.value)}
                options={yearChoices(data.current).map((code) => ({ value: code, label: code }))}
                disabled={setYear.isPending}
              />
            </div>
            <Button
              variant="primary"
              disabled={(!changed && !needsSync) || setYear.isPending}
              onClick={() => setConfirming(true)}
            >
              {text.apply}
            </Button>
          </div>
        ) : (
          <p className="text-small text-muted">{text.readOnly}</p>
        )}
      </CardBody>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => void apply()}
        title={text.confirmTitle}
        consequence={text.confirmBody(choice, data?.schools ?? 0)}
        confirmLabel={text.confirmLabel}
        cancelLabel={text.cancel}
        loading={setYear.isPending}
      />
    </Card>
  )
}
