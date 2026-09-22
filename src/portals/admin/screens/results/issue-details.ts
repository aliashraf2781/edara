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
}
