import type { ChangeEvent } from 'react'
import { useTableContext } from './TableContext'
import { columnKey } from './types'
import { FilterControl } from './FilterControl'

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
  const filtersInToolbar = filterConfig.position === 'toolbar' && filterableColumns.length > 0
  const showSearch = searchConfig.visible
  const showFilters = filterConfig.visible && filtersInToolbar
  const hasActiveFilters = Object.keys(filters).length > 0
  // When filters render in the header row instead, still surface a way to
  // clear them from the toolbar — there's no natural place for it otherwise.
  const showClearFiltersOnly = filterConfig.visible && !filtersInToolbar && hasActiveFilters

  if (!showSearch && !showFilters && !showClearFiltersOnly) return null

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

      {showClearFiltersOnly && (
        <button type="button" className="table-filters-clear" onClick={clearFilters}>
          Clear filters
        </button>
      )}
    </div>
  )
}
