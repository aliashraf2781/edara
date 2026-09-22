import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '~/lib/api/error'

/** 4xx never becomes true on a retry; only transport and 5xx faults do. */
const shouldRetry = (failureCount: number, error: unknown) => {
  if (isApiError(error) && error.status < 500) return false
  return failureCount < 2
}

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 30_000,
        // Admin work is long-lived form entry; refetching on tab focus would
        // swap data under the user mid-edit.
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  })
