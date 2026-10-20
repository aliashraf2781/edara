import type { FieldErrors } from './envelope'

/**
 * The only error shape the UI ever handles. `message` is always the server's
 * own sentence, so screens can render it without translating status codes.
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors | null
  readonly retryAfterSeconds: number | null
  /**
   * Keys of a 422's `data` that are not message lists (an object, an array of
   * objects), e.g. the term import's `termCheck` / `availableTerms`. Kept
   * apart from `fieldErrors` so a screen never renders them as messages.
   */
  readonly extras: Record<string, unknown> | null

  constructor(
    status: number,
    message: string,
    fieldErrors: FieldErrors | null = null,
    retryAfterSeconds: number | null = null,
    extras: Record<string, unknown> | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.retryAfterSeconds = retryAfterSeconds
    this.extras = extras
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isMessageList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

/**
 * Only the entries that are message lists count as field errors. A 422 may
 * also carry structured extras beside them (see `ApiError.extras`); those must
 * not make the whole payload unreadable, or the real field error is lost too.
 */
export const readFieldErrors = (data: unknown): FieldErrors | null => {
  if (!isRecord(data)) return null
  const entries = Object.entries(data)
  const fields = entries.filter((entry): entry is [string, string[]] => isMessageList(entry[1]))
  // An object with no message list at all is not a validation payload, unless
  // it is empty (a bare 422 still counts as one, with nothing to show).
  if (fields.length === 0 && entries.length > 0) return null
  return Object.fromEntries(fields)
}

export const readErrorExtras = (data: unknown): Record<string, unknown> | null => {
  if (!isRecord(data)) return null
  const extras = Object.entries(data).filter(([, value]) => !isMessageList(value))
  return extras.length > 0 ? Object.fromEntries(extras) : null
}
