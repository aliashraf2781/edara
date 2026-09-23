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

  /**
   * Applies one or more key/value changes in a single history update.
   * setSearchParams doesn't compose the way useState's functional updates
   * do — two separate calls in the same tick (e.g. narrowing the grade,
   * which also clears whatever classroom was picked) race each other, and
   * only the last one's diff survives, silently dropping the first. Every
   * caller that used to change more than one key via back-to-back
   * setValue() calls must go through this instead.
   */
  const setValues = useCallback(
    (changes: Partial<Record<K, string>>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(changes) as [K, string][]) {
            if (value === '' || value === defaults[key]) next.delete(key)
            else next.set(key, value)
          }
          next.delete(PAGE_KEY)
          return next
        },
        { replace: true },
      )
    },
    [setParams, defaults],
  )

  const setValue = useCallback((key: K, value: string) => setValues({ [key]: value } as Partial<Record<K, string>>), [
    setValues,
  ])

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

  return { values, page, setValue, setValues, setPage, clear }
}
