export type StoredSession = {
  accessToken: string
  refreshToken: string | null
}

export type TokenStore = {
  read: () => StoredSession | null
  write: (session: StoredSession | null) => void
  subscribe: (listener: () => void) => () => void
}

const isSession = (value: unknown): value is StoredSession =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as StoredSession).accessToken === 'string'

/**
 * One store per portal. The namespace is part of the storage key, so a stale
 * global-admin token can never be read back by the school portal or vice
 * versa (spec 3, "never store both portals' tokens under the same key").
 */
export function createTokenStore(namespace: string): TokenStore {
  const key = `edara.${namespace}.session`
  const listeners = new Set<() => void>()

  // Mirrored in memory: every request reads the token, storage reads are not free.
  let cached: StoredSession | null = null
  let loaded = false

  const load = (): StoredSession | null => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const parsed: unknown = JSON.parse(raw)
      return isSession(parsed) ? parsed : null
    } catch {
      return null
    }
  }

  return {
    read() {
      if (!loaded) {
        cached = load()
        loaded = true
      }
      return cached
    },
    write(session) {
      cached = session
      loaded = true
      try {
        if (session) localStorage.setItem(key, JSON.stringify(session))
        else localStorage.removeItem(key)
      } catch {
        /* Storage unavailable: the session still works until the tab closes. */
      }
      for (const listener of listeners) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
