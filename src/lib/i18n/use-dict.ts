import { useLocale } from './locale-context'
import type { Dict } from './locales'

/**
 * Picks a feature's strings for the active locale. The dictionary is a plain
 * module import, so it ships in that feature's chunk and nothing else's.
 */
export function useDict<T>(dict: Dict<T>): T {
  return dict[useLocale().locale]
}
