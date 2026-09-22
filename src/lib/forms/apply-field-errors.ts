import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { isApiError, isValidationError } from '~/lib/api/error'

export type SubmitFailure = {
  /** Messages that matched no field on this form, shown as a form-level alert. */
  formMessage: string | null
}

/**
 * Routes a 422 onto the form. Field names are deliberately the API's own
 * snake_case body keys, so no casing conversion can silently drop an error
 * (guide 6: request and response casing do not agree).
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  fallback: string,
): SubmitFailure {
  if (!isValidationError(error)) {
    return { formMessage: isApiError(error) ? error.message : fallback }
  }

  const known = new Set<string>(fields)
  const orphaned: string[] = []

  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const message = messages[0]
    if (!message) continue
    // `roles.0` belongs to the `roles` field.
    const base = field.split('.')[0]
    if (known.has(field)) setError(field as Path<T>, { type: 'server', message })
    else if (known.has(base)) setError(base as Path<T>, { type: 'server', message })
    else orphaned.push(message)
  }

  return { formMessage: orphaned.length > 0 ? orphaned.join(' ') : null }
}
