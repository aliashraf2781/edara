/**
 * Hand-filled lines on the official extract: the header date, plus the
 * destination / transfer lines under the grades table. Every one is optional —
 * leaving them blank keeps the dotted rules for handwriting.
 *
 * Kept apart from the dialog component so the print screen can import the type
 * and the empty set without breaking fast refresh.
 */
export type IssueDetails = {
  /** Top-of-page «التاريخ» — day / month / full year. */
  issueDay: string
  issueMonth: string
  issueYear: string
  submittedTo: string
  transferNumber: string
  transferDay: string
  transferMonth: string
  transferYear: string
  amount: string
  /** Manual fallbacks when the extract cannot auto-fill these slots. */
  gradeOrdinal: string
  nextOrdinal: string
  yearFrom: string
  yearTo: string
  seatNo: string
  round: string
}

export const EMPTY_ISSUE_DETAILS: IssueDetails = {
  issueDay: '',
  issueMonth: '',
  issueYear: '',
  submittedTo: '',
  transferNumber: '',
  transferDay: '',
  transferMonth: '',
  transferYear: '',
  amount: '',
  gradeOrdinal: '',
  nextOrdinal: '',
  yearFrom: '',
  yearTo: '',
  seatNo: '',
  round: '',
}

/** Values the extract already knows — empty means the officer must type them. */
export type AutoFilledSlots = {
  gradeOrdinal: string
  nextOrdinal: string
  yearFrom: string
  yearTo: string
  seatNo: string
  round: string
}

export const EMPTY_AUTO_FILLED: AutoFilledSlots = {
  gradeOrdinal: '',
  nextOrdinal: '',
  yearFrom: '',
  yearTo: '',
  seatNo: '',
  round: '',
}

/** Calendar parts for today, in the same string shapes the extract stores. */
export function todayDateParts() {
  const now = new Date()
  return {
    day: String(now.getDate()),
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    year2: String(now.getFullYear()).slice(-2),
  }
}

/**
 * Fills any empty date part with today's value so the issue dialog opens
 * on the current day. Already-typed figures are left alone.
 */
export function withTodayDefaults(details: IssueDetails): IssueDetails {
  const today = todayDateParts()
  return {
    ...details,
    issueDay: details.issueDay || today.day,
    issueMonth: details.issueMonth || today.month,
    issueYear: details.issueYear || today.year,
    transferDay: details.transferDay || today.day,
    transferMonth: details.transferMonth || today.month,
    transferYear: details.transferYear || today.year2,
  }
}
