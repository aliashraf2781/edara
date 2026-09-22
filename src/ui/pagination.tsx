import type { PageMeta } from '~/lib/api/envelope'
import { Button } from './button'
import { Icon } from './icon'

type PaginationProps = {
  meta: PageMeta | undefined
  onPageChange: (page: number) => void
  labels: {
    previous: string
    next: string
    /** e.g. "Page {page} of {pages} — {total} records" */
    summary: (meta: PageMeta) => string
  }
}

/**
 * Page numbers are derived from `meta`, not from `links` — the API sends only
 * a `next` link, so a link-driven control could never go back.
 */
export function Pagination({ meta, onPageChange, labels }: PaginationProps) {
  if (!meta || meta.last_page <= 1) return null

  const atStart = meta.current_page <= 1
  const atEnd = meta.current_page >= meta.last_page

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4" aria-label={labels.summary(meta)}>
      <p className="text-small text-muted">{labels.summary(meta)}</p>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={atStart}
          aria-label={labels.previous}
        >
          <Icon name="chevronStart" directional />
          {labels.previous}
        </Button>
        <Button
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={atEnd}
          aria-label={labels.next}
        >
          {labels.next}
          <Icon name="chevronEnd" directional />
        </Button>
      </div>
    </nav>
  )
}
