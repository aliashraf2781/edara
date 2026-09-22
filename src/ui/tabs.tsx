import { cn } from './cn'

export type TabItem<T extends string> = { id: T; label: string }

type TabsProps<T extends string> = {
  label: string
  items: readonly TabItem<T>[]
  active: T
  onChange: (id: T) => void
}

/** Tabs sit on the surface; the strip beneath them is the ledger rule. */
export function Tabs<T extends string>({ label, items, active, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
      {items.map((item) => {
        const selected = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              'h-11 shrink-0 border-b-2 px-4 text-body whitespace-nowrap',
              'transition-colors duration-150 ease-out',
              selected
                ? 'border-accent font-semibold text-ink'
                : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
