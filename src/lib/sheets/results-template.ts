/**
 * The downloadable results template.
 *
 * It ships pre-filled: every enrolled student of the chosen grade, with a
 * plausible mark in each subject column. Downloading it and uploading it back
 * unchanged is therefore a complete, successful import — which is exactly the
 * round trip the upload screen asks an operator to make.
 *
 * Column names come from `~/lib/curriculum`, so the sheet, the importer and
 * the printed extract can never drift apart.
 */

import * as XLSX from 'xlsx'
import {
  FAILED_LABEL,
  PASSED_LABEL,
  type CurriculumSubject,
} from '~/lib/curriculum'

export type TemplateStudent = {
  serial: number
  student_code: string
  name: string
  classroom: string
}

export type TemplateInput = {
  schoolName: string
  gradeName: string
  termName: string
  subjects: readonly CurriculumSubject[]
  students: readonly TemplateStudent[]
  /** Off for a blank sheet an operator fills in by hand. */
  prefill?: boolean
}

export const FIXED_HEADERS = ['م', 'كود الطالب', 'اسم الطالب', 'الفصل'] as const

/** Deterministic per student + subject, so two downloads agree. */
function sampleValue(subject: CurriculumSubject, seed: string): string | number {
  let hash = 2166136261
  const key = `${seed}:${subject.id}`
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  const unit = (hash >>> 0) / 4294967296

  if (subject.grading_type === 'qualitative') {
    return unit < 0.975 ? PASSED_LABEL : FAILED_LABEL
  }

  const pass = subject.pass_score ?? 50
  const max = subject.max_score ?? 100
  return unit < 0.975
    ? pass + (Math.floor(unit * (max - pass + 1)) % (max - pass + 1))
    : Math.round(pass * 0.5) + Math.floor(unit * 10)
}

export function buildResultsWorkbook(input: TemplateInput): XLSX.WorkBook {
  const { subjects, students, prefill = true } = input
  const headers = [...FIXED_HEADERS, ...subjects.map((subject) => subject.name)]

  // Two banner rows above the header: what the sheet is, and how to fill it.
  const banner = [`${input.schoolName} — ${input.gradeName} — ${input.termName}`]
  const legend = [
    `المواد الرقمية: درجة من ٠ إلى ١٠٠. مواد الاجتياز: اكتب «${PASSED_LABEL}» أو «${FAILED_LABEL}». لا تغيّر أسماء الأعمدة ولا كود الطالب.`,
  ]

  const rows = students.map((student) => [
    student.serial,
    student.student_code,
    student.name,
    student.classroom,
    ...subjects.map((subject) => (prefill ? sampleValue(subject, student.student_code) : '')),
  ])

  const matrix: unknown[][] = [banner, legend, [], headers, ...rows]
  const sheet = XLSX.utils.aoa_to_sheet(matrix)

  sheet['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 26 },
    { wch: 10 },
    ...subjects.map((subject) => ({ wch: Math.max(12, Math.min(24, subject.name.length + 4)) })),
  ]
  sheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
  ]
  // Right-to-left, so the sheet opens the way the form is printed.
  sheet['!views'] = [{ RTL: true }]

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'النتائج')

  // A second, read-only tab documenting the marks each column accepts.
  const key = XLSX.utils.aoa_to_sheet([
    ['المادة', 'نوع التقييم', 'الدرجة النهائية', 'الدرجة الصغرى'],
    ...subjects.map((subject) => [
      subject.name,
      subject.grading_type === 'numeric' ? 'درجات' : 'اجتياز / لم يجتز',
      subject.max_score ?? '—',
      subject.pass_score ?? '—',
    ]),
  ])
  key['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 14 }]
  key['!views'] = [{ RTL: true }]
  XLSX.utils.book_append_sheet(book, key, 'دليل المواد')

  return book
}

export const templateFileName = (input: { gradeName: string; termName: string }) =>
  `نتائج-${input.gradeName}-${input.termName}.xlsx`.replace(/\s+/g, '-')

/** Builds the workbook and hands it to the browser as a download. */
export function downloadResultsTemplate(input: TemplateInput) {
  XLSX.writeFile(buildResultsWorkbook(input), templateFileName(input), { bookType: 'xlsx' })
}
