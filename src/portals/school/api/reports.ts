import { useQuery } from '@tanstack/react-query'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { ReportSummary } from './types'

/**
 * Counts published results only, and is computed live on every call — there is
 * no cached "as of" timestamp to show.
 */
export function useReportSummary(examPeriodId: string) {
  return useQuery({
    queryKey: schoolKeys.report(examPeriodId),
    queryFn: ({ signal }) =>
      schoolApi.get<ReportSummary>(
        '/school/reports/summary',
        { exam_period_id: examPeriodId },
        { signal },
      ),
    enabled: examPeriodId !== '',
    // Live figures: a stale cache would misrepresent what has been published.
    staleTime: 0,
  })
}
