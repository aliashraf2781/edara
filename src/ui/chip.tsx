import { Icon } from './icon'

type ChipProps = {
  label: string
  value: string
  onRemove: () => void
  removeLabel: string
}

/** Active filters stay visible above the table rather than hidden in a panel. */
export function FilterChip({ label, value, onRemove, removeLabel }: ChipProps) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-line bg-sunken px-4 text-small text-ink">
      <span className="label-micro">{label}</span>
      <span>{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${label}`}
        className="rounded-pill p-1 text-muted transition-colors duration-150 ease-out hover:text-danger"
      >
        <Icon name="close" className="size-4" />
      </button>
    </span>
  )
}
