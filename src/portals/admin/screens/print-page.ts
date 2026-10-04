/**
 * Prints the on-screen form sheet without Chrome's default header/footer
 * (date, document title, URL). Those only fit in @page margins, so the
 * print document uses margin:0 and an empty <title>; the sheet is cloned
 * into an about:blank iframe so the URL line has nothing to show.
 */
export function printPage() {
  const extractPage = document.querySelector<HTMLElement>('.extract .page')
  const statementSheet = document.querySelector<HTMLElement>('.statement .sheet')
  const sheet = extractPage ?? statementSheet
  if (!sheet) {
    window.print()
    return
  }

  const landscape = extractPage !== null
  const wrapped = landscape
    ? `<div class="extract-screen"><div class="extract">${sheet.outerHTML}</div></div>`
    : `<div class="statement-screen"><div class="statement">${sheet.outerHTML}</div></div>`

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n')

  const pageRule = landscape
    ? '@page{ size:A4 landscape; margin:0 !important; }'
    : '@page{ size:A4 portrait; margin:0 !important; }'

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title></title>
${styles}
<style>
  ${pageRule}
  html, body{
    margin:0 !important;
    padding:0 !important;
    width:100%;
    height:100%;
    background:#fff;
  }
  body{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .extract-chrome, .statement-chrome{ display:none !important; }
</style>
</head>
<body>${wrapped}</body>
</html>`

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
  })
  document.body.appendChild(iframe)

  const frameDoc = iframe.contentDocument
  const frameWin = iframe.contentWindow
  if (!frameDoc || !frameWin) {
    iframe.remove()
    window.print()
    return
  }

  frameDoc.open()
  frameDoc.write(html)
  frameDoc.close()
  frameDoc.title = ''

  const cleanup = () => {
    iframe.remove()
  }

  const trigger = () => {
    frameWin.focus()
    frameWin.addEventListener('afterprint', cleanup, { once: true })
    frameWin.print()
    window.setTimeout(cleanup, 2000)
  }

  if (frameDoc.readyState === 'complete') {
    window.setTimeout(trigger, 100)
  } else {
    iframe.addEventListener('load', () => window.setTimeout(trigger, 100), { once: true })
  }
}
