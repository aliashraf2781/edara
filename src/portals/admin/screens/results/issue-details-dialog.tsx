import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Field } from '~/ui/field'
import { Select, type SelectOption } from '~/ui/select'
import { NumeralInput, TextInput } from '~/ui/text-input'
import { adminText } from '../../admin.i18n'
import { EMPTY_ISSUE_DETAILS, withTodayDefaults, type AutoFilledSlots, type IssueDetails } from './issue-details'
import { resultsText } from './results.i18n'

type IssueDetailsDialogProps = {
  /** Prefill when editing values already on the extract. */
  initial?: IssueDetails
  /** Slots the extract already filled — those stay off this form. */
  autoFilled?: AutoFilledSlots
  /** Promotion line only exists on the second term. */
  showPromotion?: boolean
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
  autoFilled,
  showPromotion = false,
  onClose,
  onApply,
  onPrint,
}: IssueDetailsDialogProps) {
  const text = useDict(resultsText).issue
  const shell = useDict(adminText)
  const [values, setValues] = useState<IssueDetails>(() => {
    const base = withTodayDefaults(initial)
    if (!autoFilled) return base
    return {
      ...base,
      yearFrom: base.yearFrom || autoFilled.yearFrom,
      yearTo: base.yearTo || autoFilled.yearTo,
      seatNo: base.seatNo || autoFilled.seatNo,
    }
  })

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
        {autoFilled && autoFilled.gradeOrdinal === '' ? (
          <Field label={text.grade}>
            {(props) => (
              <Select
                {...props}
                value={values.gradeOrdinal}
                onChange={(event) => set('gradeOrdinal')(event.target.value)}
                options={gradeOptions(values.gradeOrdinal)}
                placeholder={text.grade}
              />
            )}
          </Field>
        ) : null}

        {autoFilled && showPromotion && autoFilled.nextOrdinal === '' ? (
          <Field label={text.nextGrade}>
            {(props) => (
              <Select
                {...props}
                value={values.nextOrdinal}
                onChange={(event) => set('nextOrdinal')(event.target.value)}
                options={gradeOptions(values.nextOrdinal)}
                placeholder={text.nextGrade}
              />
            )}
          </Field>
        ) : null}

        {autoFilled ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={text.yearFrom}>
              {(props) => (
                <Select
                  {...props}
                  value={values.yearFrom}
                  onChange={(event) => set('yearFrom')(event.target.value)}
                  options={yearOptions('full', values.yearFrom)}
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
                  options={yearOptions('full', values.yearTo)}
                  placeholder={text.year}
                />
              )}
            </Field>
          </div>
        ) : null}

        {autoFilled ? (
          <Field label={text.seatNo}>
            {(props) => (
              <NumeralInput
                {...props}
                value={values.seatNo}
                onChange={(event) => set('seatNo')(event.target.value)}
                inputMode="numeric"
              />
            )}
          </Field>
        ) : null}

        {autoFilled && autoFilled.round === '' ? (
          <Field label={text.round}>
            {(props) => (
              <Select
                {...props}
                value={values.round}
                onChange={(event) => set('round')(event.target.value)}
                options={[
                  { value: text.roundFirst, label: text.roundFirst },
                  { value: text.roundSecond, label: text.roundSecond },
                ]}
                placeholder={text.round}
              />
            )}
          </Field>
        ) : null}

        <Field label={text.issueDate} hint={text.issueDateHint}>
          {(props) => (
            <DateSelects
              fieldProps={props}
              day={values.issueDay}
              month={values.issueMonth}
              year={values.issueYear}
              yearMode="full"
              labels={{ day: text.day, month: text.month, year: text.year }}
              onDay={set('issueDay')}
              onMonth={set('issueMonth')}
              onYear={set('issueYear')}
              autoFocus
            />
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
            <DateSelects
              fieldProps={props}
              day={values.transferDay}
              month={values.transferMonth}
              year={values.transferYear}
              yearMode="short"
              labels={{ day: text.day, month: text.month, year: text.year }}
              onDay={set('transferDay')}
              onMonth={set('transferMonth')}
              onYear={set('transferYear')}
            />
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

const GRADE_WORDS = ['أول', 'ثاني', 'ثالث', 'رابع', 'خامس', 'سادس'] as const

function gradeOptions(current: string): SelectOption[] {
  const options = GRADE_WORDS.map((value) => ({ value, label: value }))
  if (current !== '' && !(GRADE_WORDS as readonly string[]).includes(current)) {
    return [{ value: current, label: current }, ...options]
  }
  return options
}

const DAY_OPTIONS: SelectOption[] = Array.from({ length: 31 }, (_, index) => {
  const value = String(index + 1)
  return { value, label: value }
})

const MONTH_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, index) => {
  const value = String(index + 1)
  return { value, label: value }
})

function yearOptions(mode: 'full' | 'short', current: string): SelectOption[] {
  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 12 }, (_, index) => thisYear - 10 + index)
  const currentFull = current === '' ? NaN : mode === 'full' ? Number(current) : 2000 + Number(current)
  if (Number.isFinite(currentFull) && !years.includes(currentFull)) {
    years.push(currentFull)
    years.sort((a, b) => a - b)
  }
  return years.map((year) => {
    const full = String(year)
    const value = mode === 'full' ? full : full.slice(-2)
    return { value, label: value }
  })
}

type DateSelectsProps = {
  day: string
  month: string
  year: string
  yearMode: 'full' | 'short'
  labels: { day: string; month: string; year: string }
  onDay: (value: string) => void
  onMonth: (value: string) => void
  onYear: (value: string) => void
  autoFocus?: boolean
  fieldProps: {
    id: string
    'aria-invalid': boolean | undefined
    'aria-describedby': string | undefined
  }
}

function DateSelects({
  day,
  month,
  year,
  yearMode,
  labels,
  onDay,
  onMonth,
  onYear,
  autoFocus,
  fieldProps,
}: DateSelectsProps) {
  return (
    <div className="flex items-center gap-2" dir="ltr">
      <div className="w-24">
        <Select
          {...fieldProps}
          value={day}
          onChange={(event) => onDay(event.target.value)}
          aria-label={labels.day}
          options={DAY_OPTIONS}
          autoFocus={autoFocus}
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
      <span className="text-muted">{yearMode === 'short' ? '/ 20' : '/'}</span>
      <div className={yearMode === 'full' ? 'w-28' : 'w-24'}>
        <Select
          value={year}
          onChange={(event) => onYear(event.target.value)}
          aria-label={labels.year}
          options={yearOptions(yearMode, year)}
        />
      </div>
    </div>
  )
}
