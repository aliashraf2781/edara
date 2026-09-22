import { isApiError } from '~/lib/api/error'
import { Button } from './button'
import { Icon } from './icon'

type ErrorStateLabels = {
  title: string
  retry: string
  /** Rendered instead of `title` when the tier limit is hit. */
  rateLimited: (seconds: number) => string
}

type ErrorStateProps = {
  error: unknown
  onRetry?: () => void
  labels: ErrorStateLabels
}

/**
 * Every failure surfaces the server's own `message`. A 429 shows the wait in
 * seconds from `Retry-After` rather than a generic "something went wrong".
 */
export function ErrorState({ error, onRetry, labels }: ErrorStateProps) {
  const apiError = isApiError(error) ? error : null
  const retryAfter = apiError?.retryAfterSeconds ?? null

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-card border border-danger/30 bg-danger/5 p-6 shadow-xs"
    >
      <p className="flex items-center gap-2 text-h2 font-semibold text-danger">
        <Icon name="alert" />
        {retryAfter === null ? labels.title : labels.rateLimited(retryAfter)}
      </p>
      <p className="text-small text-muted">
        {apiError?.message ?? (error instanceof Error ? error.message : labels.title)}
      </p>
      {onRetry ? <Button onClick={onRetry}>{labels.retry}</Button> : null}
    </div>
  )
}
