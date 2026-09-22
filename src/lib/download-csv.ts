/** Excel reads a CSV as the system codepage unless it starts with a BOM. */
const BOM = String.fromCharCode(0xfeff)

/** Escapes a cell for CSV: quotes double up, and any delimiter forces quoting. */
const escapeCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value

/**
 * Builds a file in the browser and hands it to the user. Used for the import
 * template, which has no endpoint behind it — the columns are fixed and known.
 */
export function downloadCsv(filename: string, rows: readonly (readonly string[])[]) {
  const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')
  // The BOM makes Excel read the file as UTF-8 rather than the system codepage.
  const blob = new Blob([`${BOM}${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}
