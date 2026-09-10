import { useTableContext } from './TableContext'

function SortIcon({ direction }) {
  if (!direction) return <span className="table-sort-icon table-sort-icon--idle">↕</span>
  return (
    <span className="table-sort-icon table-sort-icon--active">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export function TableHeader() {
  const { columns, sort, toggleSort, sortable, hasActionColumn, actionColumnLabel, hasExpandColumn } =
    useTableContext()

  return (
    <thead className="table-header">
      <tr>
        {hasExpandColumn && (
          <th className="table-header-cell table-header-cell--expand" aria-hidden="true" />
        )}
        {columns.map((column) => {
          const key = column.key ?? column.accessor
          const columnSortable = sortable && column.sortable !== false
          const isActive = sort?.key === key

          return (
            <th
              key={key}
              className={`table-header-cell${columnSortable ? ' table-header-cell--sortable' : ''}`}
              style={{ width: column.width, textAlign: column.align ?? 'left' }}
              aria-sort={isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              onClick={columnSortable ? () => toggleSort(key) : undefined}
            >
              <span className="table-header-cell-content">
                {column.header}
                {columnSortable && <SortIcon direction={isActive ? sort.direction : null} />}
              </span>
            </th>
          )
        })}
        {hasActionColumn && (
          <th className="table-header-cell table-header-cell--actions" aria-label={actionColumnLabel}>
            {actionColumnLabel}
          </th>
        )}
      </tr>
    </thead>
  )
}
