import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Field } from '~/ui/field'
import { Select, type SelectOption } from '~/ui/select'
import { NumeralInput, TextInput } from '~/ui/text-input'
import { adminText } from '../../admin.i18n'
import { statementText } from './enrollment-statement.i18n'
import { withTodayDates, type StatementDetails } from './statement-details'

type StatementDetailsDialogProps = {
  initial: StatementDetails
  onClose: () => void
  /** Drops every edit and goes back to the school's records. */
  onReset: () => void
  /** Writes the fields onto the statement without opening the print dialog. */
  onApply: (details: StatementDetails) => void
  /** Writes the fields, then opens the browser print dialog. */
  onPrint: (details: StatementDetails) => void
}

/** Mounted only while it is open. */
export function StatementDetailsDialog({ initial, onClose, onReset, onApply, onPrint }: StatementDetailsDialogProps) {
  const text = useDict(statementText).dialog
  const shell = useDict(adminText)
  const [values, setValues] = useState<StatementDetails>(() => withTodayDates(initial))

  const set = (key: keyof StatementDetails) => (value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }))

  // Field render props for the plain text and digit slots.
  const input = (key: keyof StatementDetails, placeholder?: string) => (props: FieldProps) => (
    <TextInput
      {...props}
      value={values[key]}
      onChange={(event) => set(key)(event.target.value)}
      placeholder={placeholder}
    />
  )

  const numeral =
    (key: keyof StatementDetails, inputMode: 'numeric' | 'decimal' = 'numeric') => (props: FieldProps) => (
      <NumeralInput
        {...props}
        value={values[key]}
        onChange={(event) => set(key)(event.target.value)}
        inputMode={inputMode}
      />
    )

  const dateLabels = { day: text.day, month: text.month, year: text.year }

  return (
    <Dialog
      open
      onClose={onClose}
      title={text.title}
      footer={
        <>
          <Button onClick={onClose}>{shell.common.cancel}</Button>
          <Button onClick={onReset}>{text.reset}</Button>
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
        <h3 className="text-body font-semibold text-ink">{text.studentSection}</h3>

        <Field label={text.studentName}>{input('studentName')}</Field>
        <Field label={text.schoolName}>{input('schoolName')}</Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={text.grade}>{input('grade', text.gradePlaceholder)}</Field>
          <Field label={text.registrationNo}>{numeral('registrationNo')}</Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={text.yearFrom}>
            {(props) => (
              <Select
                {...props}
                value={values.yearFrom}
                onChange={(event) => set('yearFrom')(event.target.value)}
                options={yearOptions(values.yearFrom)}
                placeholder={text.year}
              />
            )}
          </Field>
          <Field label={text.yearTo}>
            {(props) => (
              <Select
                {...props}
                value={values.yearTo}
                onChange={(event) => set('yearTo')(event.target.value)}
                options={yearOptions(values.yearTo)}
                placeholder={text.year}
              />
            )}
          </Field>
          <Field label={text.yearNote} hint={text.yearNoteHint}>
            {input('yearNote')}
          </Field>
        </div>

        <h3 className="mt-2 text-body font-semibold text-ink">{text.issueSection}</h3>

        <Field label={text.issueDate} hint={text.issueDateHint}>
          {(props) => (
            <DateSelects
              fieldProps={props}
              day={values.issueDay}
              month={values.issueMonth}
              year={values.issueYear}
              labels={dateLabels}
              onDay={set('issueDay')}
              onMonth={set('issueMonth')}
              onYear={set('issueYear')}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={text.transferNumber}>{numeral('transferNumber')}</Field>
          <Field label={text.amount}>{numeral('amount', 'decimal')}</Field>
        </div>

        <Field label={text.transferDate}>
          {(props) => (
            <DateSelects
              fieldProps={props}
              day={values.transferDay}
              month={values.transferMonth}
              year={values.transferYear}
              labels={dateLabels}
              onDay={set('transferDay')}
              onMonth={set('transferMonth')}
              onYear={set('transferYear')}
            />
          )}
        </Field>

        <Field label={text.submittedTo}>{input('submittedTo', text.submittedToPlaceholder)}</Field>

        {/* Enter applies the values onto the statement, like the Apply button. */}
        <button type="submit" className="sr-only" tabIndex={-1}>
          {text.apply}
        </button>
      </form>
    </Dialog>
  )
}

type FieldProps = {
  id: string
  'aria-invalid': boolean | undefined
  'aria-describedby': string | undefined
}

const DAY_OPTIONS: SelectOption[] = Array.from({ length: 31 }, (_, index) => {
  const value = String(index + 1)
  return { value, label: value }
})

const MONTH_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, index) => {
  const value = String(index + 1)
  return { value, label: value }
})

function yearOptions(current: string): SelectOption[] {
  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 12 }, (_, index) => thisYear - 10 + index)
  const chosen = Number(current)
  if (current !== '' && Number.isFinite(chosen) && !years.includes(chosen)) {
    years.push(chosen)
    years.sort((a, b) => a - b)
  }
  return years.map((year) => ({ value: String(year), label: String(year) }))
}

type DateSelectsProps = {
  day: string
  month: string
  year: string
  labels: { day: string; month: string; year: string }
  onDay: (value: string) => void
  onMonth: (value: string) => void
  onYear: (value: string) => void
  fieldProps: FieldProps
}

function DateSelects({ day, month, year, labels, onDay, onMonth, onYear, fieldProps }: DateSelectsProps) {
  return (
    <div className="flex items-center gap-2" dir="ltr">
      <div className="w-24">
        <Select
          {...fieldProps}
          value={day}
          onChange={(event) => onDay(event.target.value)}
          aria-label={labels.day}
          options={DAY_OPTIONS}
        />
      </div>
      <span className="text-muted">/</span>
      <div className="w-24">
        <Select
          value={month}
          onChange={(event) => onMonth(event.target.value)}
          aria-label={labels.month}
          options={MONTH_OPTIONS}
        />
      </div>
      <span className="text-muted">/</span>
      <div className="w-28">
        <Select
          value={year}
          onChange={(event) => onYear(event.target.value)}
          aria-label={labels.year}
          options={yearOptions(year)}
        />
      </div>
    </div>
  )
}
