/** Same origin by default; set VITE_API_BASE_URL when the API is on another host. */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

/**
 * The temporary in-browser backend is on unless it is switched off explicitly.
 * Set `VITE_MOCK_API=false` in `.env.local` to talk to the real API again.
 */
export const USE_MOCK_API: boolean = import.meta.env.VITE_MOCK_API !== 'false'
