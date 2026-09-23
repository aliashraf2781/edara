/** Same origin by default; set VITE_API_BASE_URL when the API is on another host. */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
