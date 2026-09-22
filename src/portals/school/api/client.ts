import { createApiClient } from '~/lib/api/client'
import { createTokenStore } from '~/lib/auth/token-store'
import { API_BASE_URL } from '~/lib/env'
import { currentLocale } from '~/lib/i18n/current-locale'

/** A different storage key from the admin portal, so the tokens can never mix. */
export const schoolTokens = createTokenStore('school')

export const schoolApi = createApiClient({
  baseUrl: API_BASE_URL,
  getLocale: currentLocale,
  tokens: {
    getAccessToken: () => schoolTokens.read()?.accessToken ?? null,
    // School login returns no refresh token, so there is nothing to rotate:
    // an expired token means signing in again, with the school code.
    onSessionExpired: () => schoolTokens.write(null),
  },
})
