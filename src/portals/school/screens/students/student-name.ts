import type { Student } from '../../api/types'

/** Father's and family names are optional, so a join would leave stray spaces. */
export const fullName = (student: Student): string =>
  [student.first_name, student.father_name, student.family_name].filter(Boolean).join(' ')
