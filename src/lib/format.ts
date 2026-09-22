import type { Locale } from './i18n/locales'

/** The API sends `YYYY-MM-DD HH:MM:SS`; media sends real ISO. Accept both. */
export const parseApiDate = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const normalised = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalised)
  return Number.isNaN(date.getTime()) ? null : date
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>()

const formatterFor = (locale: Locale, options: Intl.DateTimeFormatOptions, tag: string) => {
  const key = `${locale}:${tag}`
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    // Latin digits in both locales: grades and IDs must stay comparable.
    formatter = new Intl.DateTimeFormat(`${locale}-u-nu-latn`, options)
    dateFormatters.set(key, formatter)
  }
  return formatter
}

export const formatDate = (value: string | null | undefined, locale: Locale): string => {
  const date = parseApiDate(value)
  if (!date) return '—'
  return formatterFor(locale, { year: 'numeric', month: 'short', day: '2-digit' }, 'date').format(date)
}

export const formatDateTime = (value: string | null | undefined, locale: Locale): string => {
  const date = parseApiDate(value)
  if (!date) return '—'
  return formatterFor(
    locale,
    { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' },
    'datetime',
  ).format(date)
}

export const formatNumber = (value: number | null | undefined): string =>
  value === null || value === undefined || Number.isNaN(value) ? '—' : String(value)

/** One decimal, because averages come back like 68.4 and 68.40 reads as false precision. */
export const formatScore = (value: number | null | undefined): string =>
  value === null || value === undefined || Number.isNaN(value) ? '—' : value.toFixed(1)

export const formatPercent = (part: number, whole: number): string =>
  whole <= 0 ? '—' : `${((part / whole) * 100).toFixed(1)}%`
