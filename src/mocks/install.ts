/**
 * Installs the temporary backend by intercepting `fetch` for the API base URL
 * only. Nothing in the portals knows it is there — they keep calling the same
 * client, so switching back is a matter of setting `VITE_MOCK_API=false`.
 */

import { API_BASE_URL } from '~/lib/env'
import { resetMockData } from './db'
import { adminRoutes } from './handlers/admin'
import { schoolRoutes } from './handlers/school'
import { matchRoute, type MockRequest, type MockResult } from './http'

const ROUTES = [...schoolRoutes, ...adminRoutes]

/** A short, uneven delay, so loading states are exercised rather than skipped. */
const latency = () => new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 180))

const jsonResponse = (result: MockResult) =>
  new Response(
    result.status === 204
      ? null
      : JSON.stringify({
          success: result.status < 400,
          message: result.message,
          data: result.data,
        }),
    {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    },
  )

function baseUrlOrigin(): { origin: string; prefix: string } {
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    const url = new URL(API_BASE_URL)
    return { origin: url.origin, prefix: url.pathname.replace(/\/$/, '') }
  }
  return { origin: window.location.origin, prefix: API_BASE_URL.replace(/\/$/, '') }
}

async function readBody(init: RequestInit | undefined) {
  const body = init?.body
  if (!body) return { body: null as unknown, form: null as FormData | null }
  if (body instanceof FormData) return { body: null as unknown, form: body }
  if (typeof body === 'string') {
    try {
      return { body: JSON.parse(body) as unknown, form: null }
    } catch {
      return { body, form: null }
    }
  }
  return { body: null as unknown, form: null }
}

let installed = false

export function installMockApi() {
  if (installed) return
  installed = true

  const { origin, prefix } = baseUrlOrigin()
  const nativeFetch = window.fetch.bind(window)

  // An escape hatch while demoing: wipe every created school, uploaded mark
  // and import run, then reload.
  Object.defineProperty(window, 'edaraMockReset', {
    value: () => {
      resetMockData()
      window.location.reload()
    },
    configurable: true,
  })

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const href =
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

    let url: URL
    try {
      url = new URL(href, window.location.origin)
    } catch {
      return nativeFetch(input as RequestInfo, init)
    }

    const handled = url.origin === origin && url.pathname.startsWith(prefix)
    if (!handled) return nativeFetch(input as RequestInfo, init)

    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    const path = url.pathname.slice(prefix.length) || '/'
    const matched = matchRoute(ROUTES, method, path)

    await latency()

    if (!matched) {
      if (import.meta.env.DEV) console.warn(`[mock-api] no handler for ${method} ${path}`)
      return jsonResponse({ status: 404, message: 'هذه الخدمة غير متاحة في النسخة التجريبية.', data: null })
    }

    const { body, form } = await readBody(init)
    const request: MockRequest = {
      method,
      path,
      params: matched.params,
      query: url.searchParams,
      body,
      form,
      headers: new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined)),
    }

    try {
      return jsonResponse(await matched.handler(request))
    } catch (error) {
      if (import.meta.env.DEV) console.error('[mock-api] handler failed', error)
      return jsonResponse({ status: 500, message: 'تعذّر تنفيذ الطلب في النسخة التجريبية.', data: null })
    }
  }
}
