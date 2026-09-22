export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | Record<string, QueryValue>>

const isPresent = (value: QueryValue): value is string | number | boolean =>
  value !== null && value !== undefined && value !== ''

/**
 * Builds the guide's query conventions: `filter[field]=`, `sort=-field`,
 * `search=`, `per_page=`. Empty values are dropped so a cleared filter input
 * does not send `?search=` and bust the cache with a distinct key.
 */
export const buildSearchParams = (params: QueryParams = {}): string => {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && typeof value === 'object') {
      for (const [inner, innerValue] of Object.entries(value)) {
        if (isPresent(innerValue)) search.append(`${key}[${inner}]`, String(innerValue))
      }
      continue
    }
    if (isPresent(value)) search.append(key, String(value))
  }

  const encoded = search.toString()
  return encoded === '' ? '' : `?${encoded}`
}
