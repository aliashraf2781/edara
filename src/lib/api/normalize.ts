import { emptyPage, type PageMeta, type Paginated } from './envelope'

const toCount = (value: unknown, fallback: number): number => {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

/**
 * Paginated shape (since 11 Oct 2026): `{ data: T[], meta, links }`, with
 * `meta` and `links` as top-level siblings of `data`. `api.getList` returns
 * exactly that. A bare array (unpaginated endpoints such as the academic
 * reference lists) is wrapped as a single page. Anything else is an empty
 * page rather than a crash.
 */
export function normalizePage<T>(payload: unknown, fallbackPerPage = 15): Paginated<T> {
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

  if (payload === null || typeof payload !== 'object') return emptyPage(fallbackPerPage)

  const raw = payload as { data?: unknown; meta?: unknown; links?: unknown }
  if (!Array.isArray(raw.data)) return emptyPage(fallbackPerPage)

  const rows = raw.data as T[]
  const metaSource =
    raw.meta && typeof raw.meta === 'object' ? (raw.meta as Record<string, unknown>) : {}

  const meta: PageMeta = {
    total: toCount(metaSource.total, rows.length),
    per_page: toCount(metaSource.per_page, fallbackPerPage) || fallbackPerPage,
    current_page: Math.max(1, toCount(metaSource.current_page, 1)),
    last_page: Math.max(1, toCount(metaSource.last_page, 1)),
  }

  const next =
    raw.links && typeof raw.links === 'object'
      ? ((raw.links as { next?: unknown }).next ?? null)
      : null

  return { data: rows, meta, links: { next: typeof next === 'string' ? next : null } }
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
