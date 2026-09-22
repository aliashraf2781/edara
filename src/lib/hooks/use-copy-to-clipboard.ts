import { useCallback, useEffect, useRef, useState } from 'react'

/** Reports a short-lived "copied" state without keeping a timer after unmount. */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetMs)
        return true
      } catch {
        setCopied(false)
        return false
      }
    },
    [resetMs],
  )

  return { copied, copy }
}
