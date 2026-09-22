/**
 * The four hand-written lines under the grades table on the official extract.
 * Every one is optional: skipping the dialog prints the form with the original
 * dotted rules, exactly as an office would fill it in by hand.
 *
 * Kept apart from the dialog component so the print screen can import the type
 * and the empty set without breaking fast refresh.
 */
export type IssueDetails = {
  submittedTo: string
  transferNumber: string
  transferDay: string
  transferMonth: string
  transferYear: string
  amount: string
}

export const EMPTY_ISSUE_DETAILS: IssueDetails = {
  submittedTo: '',
  transferNumber: '',
  transferDay: '',
  transferMonth: '',
  transferYear: '',
  amount: '',
}
