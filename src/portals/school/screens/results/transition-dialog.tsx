import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Field } from '~/ui/field'
import { Textarea } from '~/ui/textarea'
import type { ResultStatus } from '../../api/types'
import { schoolText } from '../../school.i18n'
import { resultsText } from './results.i18n'
import { requiresReason } from './workflow'

type TransitionDialogProps = {
  target: ResultStatus
  loading: boolean
  onClose: () => void
  onConfirm: (reason: string | undefined) => void
}

/**
 * Rejection needs a reason. The API allows omitting it, but a rejection with
 * no explanation gives the teacher nothing to act on, so it is required here.
 */
export function TransitionDialog({ target, loading, onClose, onConfirm }: TransitionDialogProps) {
  const text = useDict(resultsText)
  const shell = useDict(schoolText)
  // The parent keys this dialog by target status, so choosing a different
  // move starts with an empty reason without an effect to clear it.
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  const needsReason = requiresReason(target)
  const invalid = needsReason && reason.trim() === ''

  const confirm = () => {
    setTouched(true)
    if (invalid) return
    onConfirm(needsReason ? reason.trim() : undefined)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      busy={loading}
      title={text.actions[target]}
      footer={
        <>
          <Button onClick={onClose} disabled={loading}>
            {shell.common.cancel}
          </Button>
          <Button
            variant="primary"
            destructive={target === 'rejected'}
            loading={loading}
            onClick={confirm}
          >
            {text.actions[target]}
          </Button>
        </>
      }
    >
      {needsReason ? (
        <Field
          label={text.reason}
          hint={text.reasonRequired}
          error={touched && invalid ? text.reasonRequired : undefined}
          required
        >
          {(props) => (
            <Textarea
              {...props}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
            />
          )}
        </Field>
      ) : (
        <p>{text.detailTitle}</p>
      )}
    </Dialog>
  )
}
