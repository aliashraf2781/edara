import { cn } from '~/ui/cn'

export type Stat = { label: string; value: string }

/**
 * Figures, not decoration: a label and one tabular numeral each. No icon
 * circles, no gauges — the design system rejects both.
 */
export function StatCards({ items, className }: { items: readonly Stat[]; className?: string }) {
  return (
    <dl
      className={cn(
        'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-4 shadow-xs"
        >
          <dt className="label-micro">{item.label}</dt>
          <dd className="font-mono text-display leading-none font-medium text-ink" dir="ltr">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
