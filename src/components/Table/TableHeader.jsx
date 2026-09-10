import { useTableContext } from './TableContext'

function SortIcon({ direction }) {
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

          const handleSort = () => toggleSort(key)
          const handleKeyDown = (event) => {
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
              aria-sort={isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              onClick={columnSortable ? handleSort : undefined}
              onKeyDown={columnSortable ? handleKeyDown : undefined}
              tabIndex={columnSortable ? 0 : undefined}
              role={columnSortable ? 'button' : undefined}
            >
              <span className="table-header-cell-content">
                {column.header}
                {columnSortable && <SortIcon direction={isActive ? sort.direction : null} />}
              </span>
            </th>
          )
        })}
        {hasActionColumn && (
          <th scope="col" className="table-header-cell table-header-cell--actions" aria-label={actionColumnLabel}>
            {actionColumnLabel}
          </th>
        )}
      </tr>
    </thead>
  )
}
