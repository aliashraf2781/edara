import { FAILED_LABEL, PASSED_LABEL, isQualitativePass } from '~/mocks/curriculum'
import { Stamp } from '~/ui/stamp'
import type { GradingType } from '../../api/types'

type MarkSource = {
  grading_type: GradingType
  score: number | null
  max_score: number | null
  qualitative_rating: string | null
  is_absent: boolean
}

/**
 * A qualitative subject has no numeric score to show — ever. Rendering it
 * through one component is what keeps a raw `0` from leaking into a column
 * that should read اجتياز.
 */
export function MarkCell({ value }: { value: MarkSource }) {
  if (value.is_absent) return <span className="text-muted">—</span>

  if (value.grading_type === 'qualitative') {
    // The column sets mono for numerals; Arabic has no place in that face.
    return (
      <span className="font-sans text-body">
        {isQualitativePass(value.qualitative_rating) ? PASSED_LABEL : FAILED_LABEL}
      </span>
    )
  }

  if (value.score === null) return <span className="text-muted">—</span>

  return (
    <span className="font-mono" dir="ltr">
      {value.score}
      {value.max_score === null ? null : <span className="text-muted"> / {value.max_score}</span>}
    </span>
  )
}

export function VerdictStamp({ passed, labels }: { passed: boolean; labels: { passed: string; failed: string } }) {
  return <Stamp tone={passed ? 'success' : 'danger'}>{passed ? labels.passed : labels.failed}</Stamp>
}
