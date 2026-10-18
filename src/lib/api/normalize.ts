import { emptyPage, type PageMeta, type Paginated } from './envelope'

/** A finite number at or above `min`, else `fallback` (NaN / strings / null all fall back). */
const count = (value: unknown, fallback: number, min: number): number => {
  const parsed = typeof value === 'string' && value.trim() === '' ? NaN : Number(value)
  return Number.isFinite(parsed) ? Math.max(min, Math.trunc(parsed)) : fallback
}

/**
 * Reads a list payload into the shape screens want. The current wire format
 * is `{ data: [...], meta, links }` (see `ApiClient.getPage`, which assembles
 * that from the flat envelope). Older shapes are still accepted so a stale
 * deploy or a not-yet-migrated endpoint degrades instead of breaking: the
 * nested `data.data` paginator, Laravel's raw LengthAwarePaginator
 * (`next_page_url`, fields at the top level) and a bare array.
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
    raw.meta && typeof raw.meta === 'object' && !Array.isArray(raw.meta)
      ? (raw.meta as Record<string, unknown>)
      : raw

  const currentPage = count(metaSource.current_page, 1, 1)
  const meta: PageMeta = {
    total: count(metaSource.total, rows.length, 0),
    per_page: count(metaSource.per_page, fallbackPerPage, 1),
    current_page: currentPage,
    // An empty list reports last_page 1 (guide 3). Deliberately not lifted to
    // current_page: a stale ?page=99 must still read as "past the end".
    last_page: count(metaSource.last_page, 1, 1),
  }

  const links = raw.links
  const nested =
    links && typeof links === 'object' && !Array.isArray(links)
      ? (links as { next?: unknown }).next
      : undefined
  const nextUrl = typeof nested === 'string' && nested !== '' ? nested : null
  const legacyNext =
    typeof raw.next_page_url === 'string' && raw.next_page_url !== '' ? raw.next_page_url : null

  return { data: rows, meta, links: { next: nextUrl ?? legacyNext } }
}

/**
 * Pulls the page payload out of a raw envelope. The flat shape keeps `meta`
 * and `links` beside `data`; the old shape nested them inside `data`, which
 * passes through untouched for `normalizePage` to read.
 */
export function pagePayload(envelope: { data?: unknown; meta?: unknown; links?: unknown } | null): unknown {
  if (!envelope) return null
  const flat = Array.isArray(envelope.data) && (envelope.meta != null || envelope.links != null)
  return flat ? { data: envelope.data, meta: envelope.meta, links: envelope.links } : envelope.data
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
