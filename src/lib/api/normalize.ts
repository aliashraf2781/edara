import { emptyPage, type PageMeta, type Paginated } from './envelope'

/**
 * Backend list endpoints have shipped three shapes: the documented
 * `{ data, meta, links }`, Laravel's flat LengthAwarePaginator, and a bare
 * array. Screens always want the documented shape.
 */
export function normalizePage<T>(payload: unknown, fallbackPerPage = 15): Paginated<T> {
  if (payload == null) return emptyPage(fallbackPerPage)

  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      meta: {
        total: payload.length,
        per_page: payload.length || fallbackPerPage,
        current_page: 1,
        last_page: 1,
      },
      links: { next: null },
    }
  }

  if (typeof payload !== 'object') return emptyPage(fallbackPerPage)

  const raw = payload as Record<string, unknown>
  const rows = Array.isArray(raw.data) ? (raw.data as T[]) : null
  if (rows === null) return emptyPage(fallbackPerPage)

  const metaSource =
    raw.meta && typeof raw.meta === 'object'
      ? (raw.meta as Record<string, unknown>)
      : raw

  const meta: PageMeta = {
    total: Number(metaSource.total ?? rows.length),
    per_page: Number(metaSource.per_page ?? fallbackPerPage),
    current_page: Number(metaSource.current_page ?? 1),
    last_page: Number(metaSource.last_page ?? 1),
  }

  const links = raw.links
  const next =
    links && typeof links === 'object' && !Array.isArray(links)
      ? ((links as { next?: string | null }).next ?? null)
      : typeof raw.next_page_url === 'string'
        ? raw.next_page_url
        : null

  return { data: rows, meta, links: { next } }
}

/** Spatie sometimes serialises roles as models; the UI always wants names. */
export function roleNames(roles: unknown): string[] {
  if (!Array.isArray(roles)) return []
  return roles.flatMap((role) => {
    if (typeof role === 'string') return [role]
    if (role && typeof role === 'object' && typeof (role as { name?: unknown }).name === 'string') {
      return [(role as { name: string }).name]
    }
    return []
  })
}
