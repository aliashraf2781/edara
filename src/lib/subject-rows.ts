/**
 * Pure helper: collapses repeated subject rows of one term into one row per
 * subject. Identity is the grade-subject id when the row carries one, else
 * the subject id, else the normalised subject name. The first row wins and
 * order is preserved, so a repeated row can never print a second column.
 */
type SubjectRowLike = {
  grade_subject_id?: string | null
  subject_id?: string | null
  subject_name?: string | null
}

/** Strips tatweel/diacritics and folds Arabic letter variants for name keys. */
export function normalizeArabicName(value: string): string {
  return value
    .replace(/\u0640|[\u064B-\u065F]|\u0670/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
}

function subjectKey(row: SubjectRowLike): string {
  if (row.grade_subject_id) return `gs:${row.grade_subject_id}`
  if (row.subject_id) return `s:${row.subject_id}`
  return `n:${normalizeArabicName(row.subject_name ?? '')}`
}

export function dedupeSubjectRows<T extends SubjectRowLike>(rows: readonly T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const row of rows) {
    const key = subjectKey(row)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }
  return out
}
