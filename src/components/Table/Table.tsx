import { useCallback, useMemo, useState } from 'react'
import { TableContext } from './TableContext'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import { TableRowData } from './TableRowData'
import { TableFooter } from './TableFooter'
import { TableToolbar } from './TableToolbar'
import { useTableData } from './useTableData'
import type { TableContextValue, TableProps } from './types'
import './table.css'

/**
 * Reusable, responsive table with sorting, search, filters, pagination or
 * lazy-load, a configurable action-menu column, and expandable rows
 * (accordion detail or nested child tables). Full prop reference: README.md.
 */
function TableInner<Row>({
  columns,
  data,
  mode = 'pagination',
  getRowId,
  onRowClick,
  emptyMessage = 'No data available',
  caption,
  'aria-label': ariaLabel,

  sortable = true,

  search = {},
  filters = {},

  pagination = {},

  actions = [],
  actionColumnLabel = 'Actions',

  onStateChange,

  onLoadMore,
  hasMore = false,
  loadingMore = false,

  theme = 'auto',
  expandable,

  className = '',
}: TableProps<Row>) {
  const searchConfig = useMemo(() => ({ visible: true, placeholder: 'Search…', ...search }), [search])
  const filterConfig = useMemo(() => ({ visible: true, position: 'toolbar' as const, ...filters }), [filters])
  const paginationConfig = useMemo(
    () => ({
      visible: true,
      showPageSize: true,
      showPageNumbers: true,
      pageSizeOptions: [10, 25, 50, 100],
      initialPageSize: 10,
      ...pagination,
    }),
    [pagination],
  )

  const tableData = useTableData({
    data,
    columns,
    mode,
    initialPageSize: paginationConfig.initialPageSize,
    onStateChange,
  })

  const [internalLoadingMore, setInternalLoadingMore] = useState(false)

  const expandableConfig = useMemo(
    () => (expandable?.render ? { visible: true, multiple: false, ...expandable } : null),
    [expandable],
  )
  const hasExpandColumn = Boolean(expandableConfig?.visible)

  const [expandedRowIds, setExpandedRowIds] = useState(() => new Set<string | number>())

  const isRowExpanded = useCallback((rowId: string | number) => expandedRowIds.has(rowId), [expandedRowIds])

  const toggleRowExpanded = useCallback(
    (rowId: string | number) => {
      setExpandedRowIds((prev) => {
        const next = expandableConfig!.multiple ? new Set(prev) : new Set<string | number>()
        if (prev.has(rowId)) next.delete(rowId)
        else next.add(rowId)
        return next
      })
    },
    [expandableConfig],
  )

  const lazyLoadMore = useCallback(async () => {
    if (!onLoadMore) return
    setInternalLoadingMore(true)
    try {
      await onLoadMore({ search: tableData.search, sort: tableData.sort, filters: tableData.filters })
    } finally {
      setInternalLoadingMore(false)
    }
  }, [onLoadMore, tableData.search, tableData.sort, tableData.filters])

  const rows = mode === 'lazy' ? data : tableData.rows
  const hasActionColumn = actions.length > 0

  const contextValue = useMemo<TableContextValue<Row>>(
    () => ({
      columns,
      actions,
      hasActionColumn,
      actionColumnLabel,
      getRowId,
      onRowClick,
      sortable,
      mode,
      pagination: paginationConfig,
      searchConfig,
      filterConfig,
      lazyLoadMore,
      hasMore,
      loadingMore: loadingMore || internalLoadingMore,
      expandable: expandableConfig,
      hasExpandColumn,
      isRowExpanded,
      toggleRowExpanded,
      ...tableData,
    }),
    [
      columns,
      actions,
      hasActionColumn,
      actionColumnLabel,
      getRowId,
      onRowClick,
      sortable,
      mode,
      paginationConfig,
      searchConfig,
      filterConfig,
      lazyLoadMore,
      hasMore,
      loadingMore,
      internalLoadingMore,
      expandableConfig,
      hasExpandColumn,
      isRowExpanded,
      toggleRowExpanded,
      tableData,
    ],
  )

  return (
    <TableContext.Provider value={contextValue}>
      <div
        className={`table-container ${className}`.trim()}
        data-table-theme={theme === 'auto' ? undefined : theme}
      >
        <TableToolbar />
        <span className="table-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {mode === 'pagination' ? `${tableData.total} results` : `${tableData.total} rows loaded`}
        </span>
        <div className="table-scroll">
          <table className="table" aria-label={caption ? undefined : ariaLabel}>
            {caption && <caption className="table-caption">{caption}</caption>}
            <TableHeader />
            <tbody className="table-body">
              {rows.length === 0 ? (
                <tr>
                  <td
                    className="table-empty"
                    colSpan={columns.length + (hasActionColumn ? 1 : 0) + (hasExpandColumn ? 1 : 0)}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <TableRow key={getRowId ? getRowId(row, rowIndex) : rowIndex} row={row} rowIndex={rowIndex} />
                ))
              )}
            </tbody>
            <TableFooter />
          </table>
        </div>
      </div>
    </TableContext.Provider>
  )
}

interface TableComponent {
  <Row>(props: TableProps<Row>): ReturnType<typeof TableInner>
  Header: typeof TableHeader
  Row: typeof TableRow
  RowData: typeof TableRowData
  Footer: typeof TableFooter
  Toolbar: typeof TableToolbar
}

export const Table = TableInner as TableComponent

Table.Header = TableHeader
Table.Row = TableRow
Table.RowData = TableRowData
Table.Footer = TableFooter
Table.Toolbar = TableToolbar
