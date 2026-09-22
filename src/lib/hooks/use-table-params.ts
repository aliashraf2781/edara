import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

const PAGE_KEY = 'page'

/**
 * Table state lives in the URL, so a filtered list can be shared, reloaded and
 * navigated back to. Changing any filter resets to page 1 — staying on page 6
 * of a result set that now has two pages shows an empty table.
 */
export function useTableParams<K extends string>(defaults: Readonly<Record<K, string>>) {
  const [params, setParams] = useSearchParams()

  const values = useMemo(() => {
    const entries = Object.keys(defaults).map((key) => [
      key,
      params.get(key) ?? defaults[key as K],
    ])
    return Object.fromEntries(entries) as Record<K, string>
  }, [params, defaults])

  const page = Math.max(1, Number(params.get(PAGE_KEY)) || 1)

  const setValue = useCallback(
    (key: K, value: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value === '' || value === defaults[key]) next.delete(key)
          else next.set(key, value)
          next.delete(PAGE_KEY)
          return next
        },
        { replace: true },
      )
    },
    [setParams, defaults],
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (nextPage <= 1) next.delete(PAGE_KEY)
          else next.set(PAGE_KEY, String(nextPage))
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const clear = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams])

  return { values, page, setValue, setPage, clear }
}
