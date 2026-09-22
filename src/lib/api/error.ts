import type { FieldErrors } from './envelope'

/**
 * The only error shape the UI ever handles. `message` is always the server's
 * own sentence, so screens can render it without translating status codes.
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors | null
  readonly retryAfterSeconds: number | null

  constructor(
    status: number,
    message: string,
    fieldErrors: FieldErrors | null = null,
    retryAfterSeconds: number | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError

/** A 422 that actually carried field-level errors, so `fieldErrors` is known. */
export type ValidationError = ApiError & { fieldErrors: FieldErrors }

export const isValidationError = (error: unknown): error is ValidationError =>
  isApiError(error) && error.status === 422 && error.fieldErrors !== null

/** 401/403 are terminal for the current view — retrying them never helps. */
export const isAuthError = (error: unknown): boolean =>
  isApiError(error) && (error.status === 401 || error.status === 403)

const looksLikeFieldErrors = (value: unknown): value is FieldErrors =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(
    (entry) => Array.isArray(entry) && entry.every((item) => typeof item === 'string'),
  )

export const readFieldErrors = (data: unknown): FieldErrors | null =>
  looksLikeFieldErrors(data) ? data : null
