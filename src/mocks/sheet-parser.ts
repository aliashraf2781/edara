/** Reads an uploaded .xlsx/.xls/.csv back into header + row records. */

import * as XLSX from 'xlsx'

export type ParsedSheet = {
  sheetName: string
  headers: string[]
  rows: Record<string, string>[]
}

const clean = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value).replace(/\s+/g, ' ').trim()

export async function parseSheet(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return { sheetName: sheetName ?? '', headers: [], rows: [] }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: '' })

  // The template may carry a title band above the header row, so the header is
  // the first row that actually names the student-code column.
  const headerIndex = matrix.findIndex((row) =>
    row.some((cell) => clean(cell) === 'كود الطالب' || clean(cell) === 'student_code'),
  )
  if (headerIndex === -1) return { sheetName, headers: [], rows: [] }

  const headers = matrix[headerIndex].map(clean)

  const rows = matrix
    .slice(headerIndex + 1)
    .map((row) => {
      const record: Record<string, string> = {}
      headers.forEach((header, column) => {
        if (header !== '') record[header] = clean(row[column])
      })
      return record
    })
    .filter((record) => Object.values(record).some((value) => value !== ''))

  return { sheetName, headers, rows }
}
