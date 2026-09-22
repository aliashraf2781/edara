import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

/**
 * Read outside React by the API client. `<html lang>` is set by LocaleProvider,
 * so this stays a single source of truth rather than a second mirrored copy.
 */
export const currentLocale = (): Locale => {
  const lang = document.documentElement.lang
  return isLocale(lang) ? lang : DEFAULT_LOCALE
}
