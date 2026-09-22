const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

/**
 * The official extract prints ١٠٠ and ٥٠, not 100 and 50, so every numeral on
 * that form goes through here. Non-digits (separators, slashes) pass through.
 */
export const toArabicDigits = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[0-9]/g, (digit) => ARABIC_INDIC[Number(digit)])
}
