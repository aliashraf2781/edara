import type { StudentTermSubject } from '../../api/types'

/** The search param the print screen reads to choose which form to show. */
export const EXTRACT_KIND_PARAM = 'kind'

export type ExtractKind = 'standard' | 'international'

export const parseExtractKind = (value: string): ExtractKind =>
  value === 'international' ? 'international' : 'standard'

export const extractPath = (code: string, studentId: string, kind: ExtractKind = 'standard') => {
  const path = `/admin/schools/${code}/students/${studentId}/print`
  return kind === 'international' ? `${path}?${EXTRACT_KIND_PARAM}=international` : path
}

/** Word inside «الصف … الابتدائي», by position within the stage. */
export const WITHIN_STAGE_ORDINAL: Readonly<Record<number, string>> = {
  1: 'الأول',
  2: 'الثاني',
  3: 'الثالث',
  4: 'الرابع',
  5: 'الخامس',
  6: 'السادس',
}

/** Folds the spelling variants Arabic grade names are typed with. */
const fold = (value: string) =>
  value
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')

/**
 * 1–6 ابتدائي · 7–9 اعدادي · 10–12 ثانوي, read off a name such as
 * «الصف الثاني الاعدادي». Undefined when the name does not say both.
 */
export function gradeLevelFromName(name: string | null | undefined): number | undefined {
  if (!name) return undefined
  const text = fold(name)

  const found = Object.entries(WITHIN_STAGE_ORDINAL).find(([, word]) => text.includes(fold(word)))
  if (!found) return undefined
  const ordinal = Number(found[0])

  if (text.includes('ابتدا')) return ordinal
  if (text.includes('اعداد')) return ordinal <= 3 ? ordinal + 6 : undefined
  if (text.includes('ثانوي')) return ordinal <= 3 ? ordinal + 9 : undefined
  return undefined
}

/**
 * The international form exists for primary only. A grade that could not be
 * read is allowed through: the form's blanks are then filled in by hand.
 */
export const canIssueInternational = (level: number | undefined) =>
  level === undefined || (level >= 1 && level <= 6)

type InternationalSlot = {
  key: 'arabic' | 'social' | 'religion'
  label: string
  matches: RegExp
}

/** The three printed columns, in order. Patterns run against folded names. */
const INTERNATIONAL_SLOTS: readonly InternationalSlot[] = [
  { key: 'arabic', label: 'اللغة العربية', matches: /عربي|arabic/i },
  { key: 'social', label: 'الدراسات الاجتماعية', matches: /دراسات|اجتماعي|social/i },
  { key: 'religion', label: 'التربية الدينية', matches: /دينيه|الدين|religio/i },
]

/** Always three columns; a subject with no record stays empty. */
export const pickInternationalSubjects = (
  subjects: readonly StudentTermSubject[],
  _gradeLevel?: number,
) =>
  INTERNATIONAL_SLOTS.map((slot) => ({
    slot,
    subject: subjects.find((subject) => slot.matches.test(fold(subject.subject_name))) ?? null,
  }))
