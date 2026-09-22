import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from './cn'

export type Column<T> = {
  key: string
  header: string
  /** Numerals set in mono and align to the trailing edge, so they flip in RTL. */
  numeric?: boolean
  headClassName?: string
  cell: (row: T) => ReactNode
}

type DataTableProps<T> = {
  /** Announced to screen readers; never rendered as a visible heading. */
  caption: string
  columns: readonly Column<T>[]
  rows: readonly T[]
  rowKey: (row: T) => string
  onRowActivate?: (row: T) => void
  isLoading?: boolean
  /** Rows carrying a secondary line get the taller rhythm. */
  tall?: boolean
  empty?: ReactNode
}

const SKELETON_ROWS = [0, 1, 2, 3, 4]

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  onRowActivate,
  isLoading = false,
  tall = false,
  empty,
}: DataTableProps<T>) {
  if (!isLoading && rows.length === 0 && empty) {
    return <>{empty}</>
  }

  const activate = (row: T) => (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onRowActivate?.(row)
  }

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-xs">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-sunken">
          <tr className="border-b border-line-strong">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'label-micro bg-sunken px-4 py-3 whitespace-nowrap',
                  column.numeric ? 'text-end' : 'text-start',
                  column.headClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? SKELETON_ROWS.map((index) => (
                <tr key={index} className="border-b border-line last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className="h-11 px-4">
                      <span className="block h-3 w-3/4 animate-pulse rounded-control bg-sunken" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  tabIndex={onRowActivate ? 0 : undefined}
                  onClick={onRowActivate ? () => onRowActivate(row) : undefined}
                  onKeyDown={onRowActivate ? activate(row) : undefined}
                  className={cn(
                    'animate-fade-in border-b border-line last:border-0',
                    'transition-colors duration-150 ease-out',
                    tall ? 'h-14' : 'h-11',
                    onRowActivate && 'cursor-pointer hover:bg-accent/5',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 align-middle',
                        column.numeric ? 'text-end font-mono' : 'text-start',
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
