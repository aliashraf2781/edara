import type { ReactNode } from 'react'
import { Icon } from './icon'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface px-6 py-16 text-center shadow-xs">
      <span className="flex size-14 items-center justify-center rounded-full bg-sunken text-muted">
        <Icon name="inbox" className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="text-h2 font-semibold text-ink">{title}</p>
        <p className="max-w-prose text-small text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}
