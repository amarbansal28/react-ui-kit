import type { KeyboardEvent } from 'react'
import { useTableContext } from './TableContext'
import { columnKey } from './types'
import type { SortDirection } from './types'
import { FilterControl } from './FilterControl'

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (!direction) return (
    <span className="table-sort-icon table-sort-icon--idle" aria-hidden="true">
      ↕
    </span>
  )
  return (
    <span className="table-sort-icon table-sort-icon--active" aria-hidden="true">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export function TableHeader() {
  const {
    columns,
    sort,
    toggleSort,
    sortable,
    hasActionColumn,
    actionColumnLabel,
    hasExpandColumn,
    filterConfig,
    filters,
    updateFilter,
  } = useTableContext()

  const showHeaderFilterRow =
    filterConfig.visible && filterConfig.position === 'header' && columns.some((c) => c.filterable)

  return (
    <thead className="table-header">
      <tr>
        {hasExpandColumn && (
          <th className="table-header-cell table-header-cell--expand" aria-hidden="true" />
        )}
        {columns.map((column) => {
          const key = columnKey(column)
          const columnSortable = sortable && column.sortable !== false
          const isActive = sort?.key === key

          const handleSort = () => toggleSort(key)
          const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleSort()
            }
          }

          return (
            <th
              key={key}
              scope="col"
              className={`table-header-cell${columnSortable ? ' table-header-cell--sortable' : ''}`}
              style={{ width: column.width, textAlign: column.align ?? 'left' }}
              dir={column.dir}
              aria-sort={isActive ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              {columnSortable ? (
                <span
                  className="table-header-cell-content"
                  onClick={handleSort}
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  role="button"
                >
                  {column.header}
                  <SortIcon direction={isActive ? sort!.direction : null} />
                </span>
              ) : (
                <span className="table-header-cell-content">{column.header}</span>
              )}
            </th>
          )
        })}
        {hasActionColumn && (
          <th
            scope="col"
            className="table-header-cell table-header-cell--actions"
            aria-label={typeof actionColumnLabel === 'string' ? actionColumnLabel : undefined}
          >
            {actionColumnLabel}
          </th>
        )}
      </tr>
      {showHeaderFilterRow && (
        <tr className="table-header-filter-row">
          {hasExpandColumn && <th className="table-header-filter-cell" aria-hidden="true" />}
          {columns.map((column) => {
            const key = columnKey(column)
            return (
              <th key={key} className="table-header-filter-cell" scope="col" dir={column.dir}>
                {column.filterable && (
                  <FilterControl
                    column={column}
                    value={filters[key]}
                    onChange={(value) => updateFilter(key, value)}
                  />
                )}
              </th>
            )
          })}
          {hasActionColumn && <th className="table-header-filter-cell" aria-hidden="true" />}
        </tr>
      )}
    </thead>
  )
}
