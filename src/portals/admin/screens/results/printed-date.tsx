import { toArabicDigits } from './arabic-digits'

type PrintedDateProps = {
  year: string
  month: string
  day: string
  /** Gregorian «م» marker after the date. Default on. */
  era?: boolean
}

/**
 * One underlined date as year / month / day. Each part is its own flex
 * item so RTL bidi cannot reorder the segments.
 */
export function PrintedDate({ year, month, day, era = true }: PrintedDateProps) {
  const y = toArabicDigits(year)
  const m = toArabicDigits(month)
  const d = toArabicDigits(day)
  const filled = y !== '' && m !== '' && d !== ''

  return (
    <span className={`date-run date-value${filled ? ' filled' : ''}`} dir="ltr">
      {filled ? (
        <>
          <span>{y}</span>
          <span>/</span>
          <span>{m}</span>
          <span>/</span>
          <span>{d}</span>
        </>
      ) : (
        <span className="date-value-slot" />
      )}
      {era ? <span>م</span> : null}
    </span>
  )
}
