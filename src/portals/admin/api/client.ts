import { createApiClient } from '~/lib/api/client'
import { createTokenStore } from '~/lib/auth/token-store'
import { API_BASE_URL } from '~/lib/env'
import { currentLocale } from '~/lib/i18n/current-locale'

/** Namespaced: this token is never readable by the school portal. */
export const adminTokens = createTokenStore('admin')

type RefreshResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  accessExpiresIn: number
  refreshExpiresIn: number
}

let onSessionExpired = () => {}

export const setAdminSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler
}

export const adminApi = createApiClient({
  baseUrl: API_BASE_URL,
  getLocale: currentLocale,
  tokens: {
    getAccessToken: () => adminTokens.read()?.accessToken ?? null,

    /**
     * The refresh token rotates on every use, so the new one must be stored or
     * the next refresh fails. A failure clears the session rather than looping.
     */
    async refresh() {
      const refreshToken = adminTokens.read()?.refreshToken
      if (!refreshToken) return null

      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
        if (!response.ok) return null

        const body = (await response.json()) as { success: boolean; data: RefreshResponse }
        if (!body.success) return null

        adminTokens.write({
          accessToken: body.data.accessToken,
          refreshToken: body.data.refreshToken,
        })
        return body.data.accessToken
      } catch {
        return null
      }
    },

    onSessionExpired() {
      adminTokens.write(null)
      onSessionExpired()
    },
  },
})
