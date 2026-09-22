import { Spinner } from './spinner'

export function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center gap-3 bg-paper text-muted">
      <Spinner label={label} className="text-accent" />
      <p className="text-small">{label}</p>
    </div>
  )
}
