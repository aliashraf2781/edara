import { useEffect, useState } from 'react'

/** Keeps search inputs responsive while the request waits for a pause in typing. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    if (Object.is(value, debounced)) return
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs, debounced])

  return debounced
}
