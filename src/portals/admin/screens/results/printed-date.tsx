import { toArabicDigits } from './arabic-digits'

type PrintedDateProps = {
  year: string
  month: string
  day: string
}

/**
 * One underlined date as year / month / day. Each part is its own flex
 * item so RTL bidi cannot put the day on the left.
 */
export function PrintedDate({ year, month, day }: PrintedDateProps) {
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
      <span>م</span>
    </span>
  )
}
