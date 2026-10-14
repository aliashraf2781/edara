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

/**
 * The API serialises decimals as strings ("68.40") and may send null, so every
 * numeric formatter goes through this. Returns null for anything unusable.
 */
const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

export const formatNumber = (value: number | string | null | undefined): string => {
  const n = toFiniteNumber(value)
  return n === null ? '—' : String(n)
}

/** One decimal, because averages come back like 68.4 and 68.40 reads as false precision. */
export const formatScore = (value: number | string | null | undefined): string => {
  const n = toFiniteNumber(value)
  return n === null ? '—' : n.toFixed(1)
}

export const formatPercent = (
  part: number | string | null | undefined,
  whole: number | string | null | undefined,
): string => {
  const p = toFiniteNumber(part)
  const w = toFiniteNumber(whole)
  return p === null || w === null || w <= 0 ? '—' : `${((p / w) * 100).toFixed(1)}%`
}
