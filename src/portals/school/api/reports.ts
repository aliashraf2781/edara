import { useQuery } from '@tanstack/react-query'
import { schoolApi } from './client'
import { schoolKeys } from './keys'
import type { ReportSummary } from './types'

/**
 * Counts published results only, and is computed live on every call — there is
 * no cached "as of" timestamp to show.
 */
export function useReportSummary(termId: string) {
  return useQuery({
    queryKey: schoolKeys.report(termId),
    queryFn: ({ signal }) =>
      schoolApi.get<ReportSummary>('/school/reports/summary', { term_id: termId }, { signal }),
    enabled: termId !== '',
    // Live figures: a stale cache would misrepresent what has been published.
    staleTime: 0,
  })
}
