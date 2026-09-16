import type { ChangeEvent } from 'react'
import { useTableContext } from './TableContext'
import { columnKey } from './types'
import type { Column } from './types'

interface FilterControlProps<Row> {
  column: Column<Row>
  value: unknown
  onChange: (value: string) => void
}

function FilterControl<Row>({ column, value, onChange }: FilterControlProps<Row>) {
  if (Array.isArray(column.filterOptions)) {
    return (
      <select
        className="table-filter-select"
        value={(value as string) ?? ''}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        aria-label={`Filter by ${column.header}`}
      >
        <option value="">All {column.header}</option>
        {column.filterOptions.map((option) => {
          const optValue = typeof option === 'object' ? option.value : option
          const optLabel = typeof option === 'object' ? option.label : option
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          )
        })}
      </select>
    )
  }

  return (
    <input
      type="text"
      className="table-filter-input"
      placeholder={`Filter ${column.header}`}
      value={(value as string) ?? ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      aria-label={`Filter by ${column.header}`}
    />
  )
}

export function TableToolbar() {
  const {
    columns,
    search,
    updateSearch,
    filters,
    updateFilter,
    clearFilters,
    searchConfig,
    filterConfig,
  } = useTableContext()

  const filterableColumns = columns.filter((c) => c.filterable)
  const showSearch = searchConfig.visible
  const showFilters = filterConfig.visible && filterableColumns.length > 0
  const hasActiveFilters = Object.keys(filters).length > 0

  if (!showSearch && !showFilters) return null

  return (
    <div className="table-toolbar">
      {showSearch && (
        <div className="table-search">
          <input
            type="search"
            className="table-search-input"
            placeholder={searchConfig.placeholder ?? 'Search…'}
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateSearch(e.target.value)}
            aria-label="Search table"
          />
        </div>
      )}

      {showFilters && (
        <div className="table-filters">
          {filterableColumns.map((column) => {
            const key = columnKey(column)
            return (
              <FilterControl
                key={key}
                column={column}
                value={filters[key]}
                onChange={(value) => updateFilter(key, value)}
              />
            )
          })}
          {hasActiveFilters && (
            <button type="button" className="table-filters-clear" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
