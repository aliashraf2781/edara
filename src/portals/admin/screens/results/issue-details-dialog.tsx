import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Field } from '~/ui/field'
import { NumeralInput, TextInput } from '~/ui/text-input'
import { adminText } from '../../admin.i18n'
import { EMPTY_ISSUE_DETAILS, type IssueDetails } from './issue-details'
import { resultsText } from './results.i18n'

type IssueDetailsDialogProps = {
  /** Prefill when editing values already on the extract. */
  initial?: IssueDetails
  onClose: () => void
  /** Writes the fields onto the extract without opening the print dialog. */
  onApply: (details: IssueDetails) => void
  /** Writes the fields, then opens the browser print dialog. */
  onPrint: (details: IssueDetails) => void
}

/**
 * Mounted only while it is open. Pass `initial` when reopening an already
 * filled extract so the officer does not retype the same figures.
 */
export function IssueDetailsDialog({
  initial = EMPTY_ISSUE_DETAILS,
  onClose,
  onApply,
  onPrint,
}: IssueDetailsDialogProps) {
  const text = useDict(resultsText).issue
  const shell = useDict(adminText)
  const [values, setValues] = useState<IssueDetails>(initial)

  const set = (key: keyof IssueDetails) => (value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }))

  return (
    <Dialog
      open
      onClose={onClose}
      title={text.title}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button onClick={() => onApply(EMPTY_ISSUE_DETAILS)}>{text.clear}</Button>
          <Button onClick={() => onApply(values)}>{text.apply}</Button>
          <Button variant="primary" onClick={() => onPrint(values)}>
            {text.print}
          </Button>
        </>
      }
    >
      <p className="text-small text-muted">{text.description}</p>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          onApply(values)
        }}
      >
        <Field label={text.issueDate} hint={text.issueDateHint}>
          {(props) => (
            <div className="flex items-center gap-2" dir="ltr">
              <NumeralInput
                {...props}
                value={values.issueDay}
                onChange={(event) => set('issueDay')(event.target.value)}
                aria-label={text.day}
                placeholder={text.day}
                maxLength={2}
                className="w-16 text-center"
                inputMode="numeric"
                autoFocus
              />
              <span className="text-muted">/</span>
              <NumeralInput
                value={values.issueMonth}
                onChange={(event) => set('issueMonth')(event.target.value)}
                aria-label={text.month}
                placeholder={text.month}
                maxLength={2}
                className="w-16 text-center"
                inputMode="numeric"
              />
              <span className="text-muted">/</span>
              <NumeralInput
                value={values.issueYear}
                onChange={(event) => set('issueYear')(event.target.value)}
                aria-label={text.year}
                placeholder={text.year}
                maxLength={4}
                className="w-20 text-center"
                inputMode="numeric"
              />
            </div>
          )}
        </Field>

        <Field label={text.submittedTo}>
          {(props) => (
            <TextInput
              {...props}
              value={values.submittedTo}
              onChange={(event) => set('submittedTo')(event.target.value)}
              placeholder={text.submittedToPlaceholder}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={text.transferNumber}>
            {(props) => (
              <NumeralInput
                {...props}
                value={values.transferNumber}
                onChange={(event) => set('transferNumber')(event.target.value)}
                inputMode="numeric"
              />
            )}
          </Field>

          <Field label={text.amount}>
            {(props) => (
              <NumeralInput
                {...props}
                value={values.amount}
                onChange={(event) => set('amount')(event.target.value)}
                inputMode="decimal"
              />
            )}
          </Field>
        </div>

        <Field label={text.transferDate} hint={text.transferDateHint}>
          {(props) => (
            <div className="flex items-center gap-2" dir="ltr">
              <NumeralInput
                {...props}
                value={values.transferDay}
                onChange={(event) => set('transferDay')(event.target.value)}
                aria-label={text.day}
                placeholder={text.day}
                maxLength={2}
                className="w-16 text-center"
                inputMode="numeric"
              />
              <span className="text-muted">/</span>
              <NumeralInput
                value={values.transferMonth}
                onChange={(event) => set('transferMonth')(event.target.value)}
                aria-label={text.month}
                placeholder={text.month}
                maxLength={2}
                className="w-16 text-center"
                inputMode="numeric"
              />
              <span className="text-muted">/ 20</span>
              <NumeralInput
                value={values.transferYear}
                onChange={(event) => set('transferYear')(event.target.value)}
                aria-label={text.year}
                placeholder={text.year}
                maxLength={2}
                className="w-16 text-center"
                inputMode="numeric"
              />
            </div>
          )}
        </Field>

        {/* Enter applies the values onto the extract, like the Apply button. */}
        <button type="submit" className="sr-only" tabIndex={-1}>
          {text.apply}
        </button>
      </form>
    </Dialog>
  )
}
