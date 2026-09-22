import { Icon } from './icon'

/**
 * Shown when a screen is reached by URL without the permission that hides it
 * from navigation — better than letting the user click into a bare 403.
 */
export function NoAccess({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface px-6 py-16 text-center shadow-xs">
      <Icon name="shield" className="size-8 text-muted" />
      <p className="text-h2 font-semibold text-ink">{title}</p>
      <p className="max-w-prose text-small text-muted">{description}</p>
    </div>
  )
}
