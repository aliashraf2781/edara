import type { StampTone } from '~/ui/stamp'
import type { ResultStatus } from '../../api/types'

/**
 * The only legal moves, mirroring the server's state machine. Anything absent
 * here is rejected with a 422, so the UI never offers it.
 */
const NEXT_STATUSES: Record<ResultStatus, readonly ResultStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['approved', 'rejected'],
  approved: ['published'],
  rejected: ['draft'],
  published: [],
}

/** Approve, reject and publish are admin moves; a teacher can only submit. */
const ADMIN_ONLY: ReadonlySet<ResultStatus> = new Set<ResultStatus>([
  'approved',
  'rejected',
  'published',
])

export const nextStatuses = (
  current: ResultStatus,
  canReview: boolean,
): readonly ResultStatus[] =>
  NEXT_STATUSES[current].filter((status) => canReview || !ADMIN_ONLY.has(status))

/** A rejection without a stated reason is useless to whoever has to fix it. */
export const requiresReason = (status: ResultStatus) => status === 'rejected'

export const STATUS_TONE: Record<ResultStatus, StampTone> = {
  draft: 'neutral',
  submitted: 'info',
  under_review: 'attention',
  approved: 'success',
  rejected: 'danger',
  // Terminal: a solid stamp rather than a tint, so it reads as final.
  published: 'sealed',
}
