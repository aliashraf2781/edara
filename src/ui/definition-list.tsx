import type { ReactNode } from 'react'
import { cn } from './cn'

export type Definition = {
  term: string
  value: ReactNode
  /** Codes, IDs and ports set in mono so they line up like a ledger column. */
  mono?: boolean
}

/** Read-only record display. Values the API never returns are never listed. */
export function DefinitionList({
  items,
  columns = 2,
}: {
  items: readonly Definition[]
  columns?: 1 | 2 | 3
}) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {items.map((item) => (
        <div key={item.term} className="flex flex-col gap-1">
          <dt className="label-micro">{item.term}</dt>
          <dd
            className={cn('text-body text-ink', item.mono && 'font-mono')}
            dir={item.mono ? 'ltr' : undefined}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
