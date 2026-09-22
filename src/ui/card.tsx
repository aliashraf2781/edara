import type { ReactNode } from 'react'
import { cn } from './cn'

/** A hairline plus a barely-there shadow lifts the card off the page canvas. */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-card border border-line bg-surface shadow-xs', className)}>
      {children}
    </section>
  )
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-4 rounded-t-card border-b border-line bg-sunken/60 px-6 py-4">
      <h2 className="text-h2 font-semibold text-ink">{title}</h2>
      {action}
    </header>
  )
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-6', className)}>{children}</div>
}
