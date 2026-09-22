/** Every endpoint answers with this, success or failure (spec 3, guide 1). */
export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type PageMeta = {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

/**
 * Paginated payloads nest the page inside `data`. There is deliberately no
 * `prev` link and no `from`/`to` — the API does not send them.
 */
export type Paginated<T> = {
  data: T[]
  meta: PageMeta
  links: { next: string | null }
}

/** Field-level 422 errors. Keys are snake_case even though payloads are camelCase. */
export type FieldErrors = Record<string, string[]>

export const emptyPage = <T,>(perPage: number): Paginated<T> => ({
  data: [],
  meta: { total: 0, per_page: perPage, current_page: 1, last_page: 1 },
  links: { next: null },
})
