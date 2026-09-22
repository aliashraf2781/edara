import { isQualitativePass } from '~/mocks/curriculum'
import type { Result } from '../../api/types'

type MarkLabels = {
  absent: string
  none: string
  qualitative: { passed: string; failed: string }
}

/**
 * A pass/fail subject never shows a number: the sheet only ever carries
 * اجتياز or لم يجتز, and a raw score there would be meaningless.
 */
export function markLabel(row: Result, labels: MarkLabels): string {
  if (row.is_absent) return labels.absent

  if (row.grading_type === 'qualitative') {
    if (row.qualitative_rating === null) return labels.none
    return isQualitativePass(row.qualitative_rating)
      ? labels.qualitative.passed
      : labels.qualitative.failed
  }

  if (row.score === null) return labels.none
  return `${row.score} / ${row.max_score ?? 100}`
}
