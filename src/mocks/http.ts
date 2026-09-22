/**
 * A tiny request router, just enough to stand in for the API while the real
 * one is not wired up. Handlers are declared as `METHOD /path/:param` and get
 * the params, the query string and the parsed body.
 */

import type { Paginated } from '~/lib/api/envelope'

export type MockRequest = {
  method: string
  path: string
  params: Record<string, string>
  query: URLSearchParams
  body: unknown
  form: FormData | null
  headers: Headers
}

export type MockResult = { status: number; message: string; data: unknown }

export type MockHandler = (request: MockRequest) => MockResult | Promise<MockResult>

export type Route = { method: string; pattern: string; handler: MockHandler }

export const ok = (data: unknown, message = 'تمت العملية بنجاح'): MockResult => ({
  status: 200,
  message,
  data,
})

export const created = (data: unknown, message = 'تم الإنشاء بنجاح'): MockResult => ({
  status: 201,
  message,
  data,
})

export const noContent = (): MockResult => ({ status: 204, message: '', data: null })

export const fail = (status: number, message: string, data: unknown = null): MockResult => ({
  status,
  message,
  data,
})

/** 422 with the field-error shape the forms already know how to read. */
export const invalid = (errors: Record<string, string[]>, message = 'تحقق من الحقول المدخلة.') =>
  fail(422, message, { errors })

export const route = (method: string, pattern: string, handler: MockHandler): Route => ({
  method,
  pattern,
  handler,
})

/** Page a plain array the way the real list endpoints do. */
export function paginate<T>(rows: readonly T[], query: URLSearchParams, defaultPerPage = 15): Paginated<T> {
  const perPage = Math.max(1, Number(query.get('per_page') ?? defaultPerPage) || defaultPerPage)
  const lastPage = Math.max(1, Math.ceil(rows.length / perPage))
  const page = Math.min(Math.max(1, Number(query.get('page') ?? 1) || 1), lastPage)
  const start = (page - 1) * perPage

  return {
    data: rows.slice(start, start + perPage) as T[],
    meta: { total: rows.length, per_page: perPage, current_page: page, last_page: lastPage },
    links: { next: page < lastPage ? `?page=${page + 1}` : null },
  }
}

type Matched = { handler: MockHandler; params: Record<string, string> }

export function matchRoute(routes: readonly Route[], method: string, path: string): Matched | null {
  const segments = path.split('/').filter(Boolean)

  for (const candidate of routes) {
    if (candidate.method !== method) continue
    const pattern = candidate.pattern.split('/').filter(Boolean)
    if (pattern.length !== segments.length) continue

    const params: Record<string, string> = {}
    let matches = true

    for (let index = 0; index < pattern.length; index += 1) {
      const part = pattern[index]
      if (part.startsWith(':')) {
        params[part.slice(1)] = decodeURIComponent(segments[index])
        continue
      }
      if (part !== segments[index]) {
        matches = false
        break
      }
    }

    if (matches) return { handler: candidate.handler, params }
  }

  return null
}

/** `filter[status]=active` and `filter%5Bstatus%5D=active` both land here. */
export function readFilter(query: URLSearchParams, key: string): string {
  return query.get(`filter[${key}]`) ?? query.get(key) ?? ''
}

export const asRecord = (body: unknown): Record<string, unknown> =>
  body && typeof body === 'object' ? (body as Record<string, unknown>) : {}

export const asString = (body: unknown, key: string): string => {
  const value = asRecord(body)[key]
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}
