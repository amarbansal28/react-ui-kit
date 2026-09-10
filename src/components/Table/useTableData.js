import { useMemo, useState } from 'react'

function getValue(row, column) {
  if (typeof column.accessor === 'function') return column.accessor(row)
  return row[column.accessor ?? column.key]
}

function defaultSort(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Drives sort/filter/search/pagination state for the table.
 * In lazy mode, filtering/sorting/pagination are assumed to already be
 * applied to `data` by the caller, so this hook just passes state through.
 */
export function useTableData({ data, columns, mode, initialPageSize, onStateChange }) {
  const [sort, setSort] = useState(null) // { key, direction: 'asc' | 'desc' }
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({}) // { [columnKey]: value }
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize ?? 10)

  const isLazy = mode === 'lazy'

  const notify = (next) => {
    onStateChange?.({ sort, search, filters, page, pageSize, ...next })
  }

  const toggleSort = (key) => {
    setSort((prev) => {
      let next
      if (!prev || prev.key !== key) next = { key, direction: 'asc' }
      else if (prev.direction === 'asc') next = { key, direction: 'desc' }
      else next = null
      notify({ sort: next })
      return next
    })
    if (isLazy) setPage(1)
  }

  const updateSearch = (value) => {
    setSearch(value)
    setPage(1)
    notify({ search: value, page: 1 })
  }

  const updateFilter = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (value === '' || value == null) delete next[key]
      notify({ filters: next, page: 1 })
      return next
    })
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setPage(1)
    notify({ filters: {}, page: 1 })
  }

  const goToPage = (nextPage) => {
    setPage(nextPage)
    notify({ page: nextPage })
  }

  const updatePageSize = (size) => {
    setPageSize(size)
    setPage(1)
    notify({ pageSize: size, page: 1 })
  }

  const processedData = useMemo(() => {
    if (isLazy) return { rows: data, total: data.length }

    let rows = data

    if (search) {
      const needle = search.toLowerCase()
      const searchableColumns = columns.filter((c) => c.searchable !== false)
      rows = rows.filter((row) =>
        searchableColumns.some((col) => {
          const value = getValue(row, col)
          return value != null && String(value).toLowerCase().includes(needle)
        }),
      )
    }

    const activeFilterKeys = Object.keys(filters)
    if (activeFilterKeys.length) {
      rows = rows.filter((row) =>
        activeFilterKeys.every((key) => {
          const column = columns.find((c) => (c.key ?? c.accessor) === key)
          const value = column ? getValue(row, column) : row[key]
          const filterValue = filters[key]
          if (typeof filterValue === 'function') return filterValue(value, row)
          return String(value ?? '').toLowerCase() === String(filterValue).toLowerCase()
        }),
      )
    }

    if (sort) {
      const column = columns.find((c) => (c.key ?? c.accessor) === sort.key)
      const compare = column?.sortFn ?? defaultSort
      rows = [...rows].sort((a, b) => {
        const result = compare(getValue(a, column), getValue(b, column), a, b)
        return sort.direction === 'asc' ? result : -result
      })
    }

    const total = rows.length

    const paginated = pageSize === -1 ? rows : rows.slice((page - 1) * pageSize, page * pageSize)

    return { rows: paginated, total }
  }, [data, columns, search, filters, sort, page, pageSize, isLazy])

  return {
    sort,
    search,
    filters,
    page,
    pageSize,
    rows: processedData.rows,
    total: processedData.total,
    toggleSort,
    updateSearch,
    updateFilter,
    clearFilters,
    goToPage,
    updatePageSize,
  }
}
