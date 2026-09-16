import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useTableData } from './useTableData'
import type { Column } from './types'

interface Row {
  id: number
  name: string
  status: string
  score: number
}

const columns: Column<Row>[] = [
  { key: 'id', header: 'ID', accessor: 'id' },
  { key: 'name', header: 'Name', accessor: 'name' },
  { key: 'status', header: 'Status', accessor: 'status', searchable: false },
  { key: 'score', header: 'Score', accessor: 'score' },
]

function makeRows(): Row[] {
  return [
    { id: 1, name: 'Alice', status: 'Active', score: 30 },
    { id: 2, name: 'Bob', status: 'Inactive', score: 10 },
    { id: 3, name: 'Carol', status: 'Active', score: 20 },
  ]
}

describe('useTableData', () => {
  it('returns all rows unsorted/unfiltered by default', () => {
    const { result } = renderHook(() => useTableData({ data: makeRows(), columns, mode: 'pagination' }))

    expect(result.current.rows.map((r) => r.id)).toEqual([1, 2, 3])
    expect(result.current.total).toBe(3)
  })

  it('sorts ascending then descending then clears on repeated toggleSort', () => {
    const { result } = renderHook(() => useTableData({ data: makeRows(), columns, mode: 'pagination' }))

    act(() => result.current.toggleSort('score'))
    expect(result.current.rows.map((r) => r.id)).toEqual([2, 3, 1])
    expect(result.current.sort).toEqual({ key: 'score', direction: 'asc' })

    act(() => result.current.toggleSort('score'))
    expect(result.current.rows.map((r) => r.id)).toEqual([1, 3, 2])
    expect(result.current.sort).toEqual({ key: 'score', direction: 'desc' })

    act(() => result.current.toggleSort('score'))
    expect(result.current.sort).toBeNull()
    expect(result.current.rows.map((r) => r.id)).toEqual([1, 2, 3])
  })

  it('switching sort to a different column starts at ascending', () => {
    const { result } = renderHook(() => useTableData({ data: makeRows(), columns, mode: 'pagination' }))

    act(() => result.current.toggleSort('score'))
    act(() => result.current.toggleSort('name'))

    expect(result.current.sort).toEqual({ key: 'name', direction: 'asc' })
    expect(result.current.rows.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Carol'])
  })

  it('uses a column sortFn when provided instead of the default comparator', () => {
    const sortFn = vi.fn((a: unknown, b: unknown) => Number(b) - Number(a))
    const customColumns: Column<Row>[] = [
      ...columns.filter((c) => c.key !== 'score'),
      { key: 'score', header: 'Score', accessor: 'score', sortFn },
    ]
    const { result } = renderHook(() => useTableData({ data: makeRows(), columns: customColumns, mode: 'pagination' }))

    act(() => result.current.toggleSort('score'))

    expect(sortFn).toHaveBeenCalled()
    expect(result.current.rows.map((r) => r.id)).toEqual([1, 3, 2])
  })

  it('filters rows by search across searchable columns only, case-insensitively', () => {
    const { result } = renderHook(() => useTableData({ data: makeRows(), columns, mode: 'pagination' }))

    act(() => result.current.updateSearch('ali'))
    expect(result.current.rows.map((r) => r.name)).toEqual(['Alice'])

    act(() => result.current.updateSearch('active'))
    expect(result.current.rows).toEqual([])

    act(() => result.current.updateSearch(''))
    expect(result.current.total).toBe(3)
  })

  it('resets to page 1 when search changes', () => {
    const { result } = renderHook(() =>
      useTableData({ data: makeRows(), columns, mode: 'pagination', initialPageSize: 1 }),
    )

    act(() => result.current.goToPage(2))
    expect(result.current.page).toBe(2)

    act(() => result.current.updateSearch('a'))
    expect(result.current.page).toBe(1)
  })

  it('applies exact-match filters and clears them', () => {
    const { result } = renderHook(() => useTableData({ data: makeRows(), columns, mode: 'pagination' }))

    act(() => result.current.updateFilter('status', 'Active'))
    expect(result.current.rows.map((r) => r.id)).toEqual([1, 3])

    act(() => result.current.updateFilter('status', ''))
    expect(result.current.total).toBe(3)

    act(() => result.current.updateFilter('status', 'Active'))
    act(() => result.current.clearFilters())
    expect(result.current.filters).toEqual({})
    expect(result.current.total).toBe(3)
  })

  it('supports a predicate function as a filter value', () => {
    const { result } = renderHook(() => useTableData({ data: makeRows(), columns, mode: 'pagination' }))

    act(() => result.current.updateFilter('score', (value: number) => value >= 20))

    expect(result.current.rows.map((r) => r.id)).toEqual([1, 3])
  })

  it('paginates rows according to page and pageSize, with -1 meaning "all"', () => {
    const { result } = renderHook(() =>
      useTableData({ data: makeRows(), columns, mode: 'pagination', initialPageSize: 2 }),
    )

    expect(result.current.rows.map((r) => r.id)).toEqual([1, 2])
    expect(result.current.total).toBe(3)

    act(() => result.current.goToPage(2))
    expect(result.current.rows.map((r) => r.id)).toEqual([3])

    act(() => result.current.updatePageSize(-1))
    expect(result.current.page).toBe(1)
    expect(result.current.rows.map((r) => r.id)).toEqual([1, 2, 3])
  })

  it('in lazy mode, passes data through untouched regardless of search/sort/filter state', () => {
    const { result } = renderHook(() => useTableData({ data: makeRows(), columns, mode: 'lazy' }))

    act(() => result.current.updateSearch('nonexistent'))

    expect(result.current.rows).toHaveLength(3)
    expect(result.current.total).toBe(3)
  })

  it('calls onStateChange with the merged next state after each mutation', () => {
    const onStateChange = vi.fn()
    const { result } = renderHook(() =>
      useTableData({ data: makeRows(), columns, mode: 'pagination', onStateChange }),
    )

    act(() => result.current.updateSearch('bob'))

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'bob', page: 1 }),
    )
  })
})
