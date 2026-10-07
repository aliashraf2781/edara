import { toArabicDigits } from './arabic-digits'

type PrintedDateProps = {
  year: string
  month: string
  day: string
  /** Gregorian «م» marker on the left of the date. Default on. */
  era?: boolean
}

/**
 * One underlined date as year / month / day (LTR), with optional «م» on
 * the left. Each part is its own flex item so RTL bidi cannot reorder them.
 */
export function PrintedDate({ year, month, day, era = true }: PrintedDateProps) {
  const y = toArabicDigits(year)
  const m = toArabicDigits(month)
  const d = toArabicDigits(day)
  const filled = y !== '' && m !== '' && d !== ''

  return (
    <span className={`date-run date-value${filled ? ' filled' : ''}`} dir="ltr">
      {/* «م» first in the LTR run so it sits on the left of the digits. */}
      {era ? <span>م</span> : null}
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
    </span>
  )
}
