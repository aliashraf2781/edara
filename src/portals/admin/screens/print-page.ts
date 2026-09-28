/**
 * Opens the system print dialog without the browser's sheet header/footer
 * (tab title, site URL, date). Those marks live in the page margin, so the
 * printed forms also set `@page { margin: 0 }`; the empty title covers the
 * remaining Chromium header.
 */
export function printPage() {
  const title = document.title
  document.title = ''
  let restored = false
  const restore = () => {
    if (restored) return
    restored = true
    document.title = title
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)
  window.print()
}
