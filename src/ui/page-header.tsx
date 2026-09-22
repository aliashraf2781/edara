import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, meta, actions }: PageHeaderProps) {
  return (
    <header className="rule-double flex flex-wrap items-end justify-between gap-4 pb-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-display font-semibold text-ink">{title}</h1>
          {meta}
        </div>
        {description ? <p className="max-w-prose text-small text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  )
}
