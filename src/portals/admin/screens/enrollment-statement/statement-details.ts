/**
 * Every slot on the بيان قيد form. The student slots open pre-filled from the
 * school's records and stay editable; the issue slots (dates, transfer,
 * destination) start empty so an untouched form keeps its dotted rules for
 * handwriting.
 *
 * Kept apart from the dialog component so the screen can import the type and
 * the helpers without breaking fast refresh.
 */
export type StatementDetails = {
  /** Top-of-page «التاريخ» — day / month / full year. */
  issueDay: string
  issueMonth: string
  issueYear: string
  /** Printed in both «بيان قيد بالصف» and «مقيد بالصف». */
  grade: string
  schoolName: string
  yearFrom: string
  yearTo: string
  /** The «عام (   )» slot after the academic year. */
  yearNote: string
  studentName: string
  registrationNo: string
  transferNumber: string
  amount: string
  transferDay: string
  transferMonth: string
  transferYear: string
  submittedTo: string
}

/** The slots the officer fills by hand on every issue. */
export const EMPTY_ISSUE_SLOTS = {
  issueDay: '',
  issueMonth: '',
  issueYear: '',
  yearNote: '',
  transferNumber: '',
  amount: '',
  transferDay: '',
  transferMonth: '',
  transferYear: '',
  submittedTo: '',
} satisfies Partial<StatementDetails>

/**
 * Fills any empty date part with today's value so the dialog opens on the
 * current day. Already-chosen figures are left alone.
 */
export function withTodayDates(details: StatementDetails): StatementDetails {
  const now = new Date()
  const day = String(now.getDate())
  const month = String(now.getMonth() + 1)
  const year = String(now.getFullYear())
  return {
    ...details,
    issueDay: details.issueDay || day,
    issueMonth: details.issueMonth || month,
    issueYear: details.issueYear || year,
    transferDay: details.transferDay || day,
    transferMonth: details.transferMonth || month,
    transferYear: details.transferYear || year,
  }
}
