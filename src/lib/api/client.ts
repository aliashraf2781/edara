import type { Locale } from '~/lib/i18n/locales'
import type { ApiEnvelope } from './envelope'
import { ApiError, readFieldErrors } from './error'
import { buildSearchParams, type QueryParams } from './query'

export type TokenProvider = {
  getAccessToken: () => string | null
  /** Omitted by portals whose login issues no refresh token (school side). */
  refresh?: () => Promise<string | null>
  onSessionExpired: () => void
}

export type ApiClientOptions = {
  baseUrl: string
  tokens: TokenProvider
  getLocale: () => Locale
}

type RequestInitLite = { signal?: AbortSignal }

const STATUS_FALLBACK: Record<number, string> = {
  401: 'Your session has ended. Sign in again to continue.',
  403: 'You do not have access to this.',
  404: 'That record no longer exists.',
  429: 'Too many requests.',
  500: 'The server could not complete this request.',
}

const fallbackMessage = (status: number) =>
  STATUS_FALLBACK[status] ?? `Request failed (${status}).`

const readRetryAfter = (response: Response): number | null => {
  if (response.status !== 429) return null
  const header = Number(response.headers.get('Retry-After'))
  return Number.isFinite(header) && header > 0 ? header : null
}

async function unwrap<T>(response: Response): Promise<T> {
  if (response.status === 204) return null as T

  let envelope: ApiEnvelope<unknown> | null
  try {
    envelope = (await response.json()) as ApiEnvelope<unknown>
  } catch {
    envelope = null
  }

  if (!response.ok || envelope?.success === false) {
    throw new ApiError(
      response.status,
      envelope?.message || fallbackMessage(response.status),
      readFieldErrors(envelope?.data),
      readRetryAfter(response),
    )
  }

  return (envelope?.data ?? null) as T
}

export type ApiClient = ReturnType<typeof createApiClient>

export function createApiClient({ baseUrl, tokens, getLocale }: ApiClientOptions) {
  /** Single-flight: a burst of 401s triggers one refresh, not one per request. */
  let refreshInFlight: Promise<string | null> | null = null

  const runRefresh = () => {
    if (!tokens.refresh) return Promise.resolve(null)
    refreshInFlight ??= tokens.refresh().finally(() => {
      refreshInFlight = null
    })
    return refreshInFlight
  }

  const send = async (path: string, init: RequestInit, token: string | null) => {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    headers.set('Accept-Language', getLocale())
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return fetch(`${baseUrl}${path}`, { ...init, headers })
  }

  const call = async <T,>(path: string, init: RequestInit): Promise<T> => {
    let response = await send(path, init, tokens.getAccessToken())

    if (response.status === 401 && tokens.refresh) {
      const renewed = await runRefresh()
      if (renewed) response = await send(path, init, renewed)
    }

    if (response.status === 401) tokens.onSessionExpired()
    return unwrap<T>(response)
  }

  const withJson = (body: unknown, init: RequestInitLite): RequestInit =>
    body === undefined
      ? { ...init }
      : { ...init, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }

  return {
    get: <T,>(path: string, query?: QueryParams, init: RequestInitLite = {}) =>
      call<T>(`${path}${buildSearchParams(query)}`, { ...init, method: 'GET' }),

    post: <T,>(path: string, body?: unknown, init: RequestInitLite = {}) =>
      call<T>(path, { ...withJson(body, init), method: 'POST' }),

    put: <T,>(path: string, body?: unknown, init: RequestInitLite = {}) =>
      call<T>(path, { ...withJson(body, init), method: 'PUT' }),

    del: <T,>(path: string, body?: unknown, init: RequestInitLite = {}) =>
      call<T>(path, { ...withJson(body, init), method: 'DELETE' }),

    /** Multipart. Never sets Content-Type — the boundary has to come from fetch. */
    upload: <T,>(path: string, form: FormData, init: RequestInitLite = {}) =>
      call<T>(path, { ...init, method: 'POST', body: form }),
  }
}
