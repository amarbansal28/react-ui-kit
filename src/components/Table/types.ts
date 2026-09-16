import type { ReactNode } from 'react'

export type Align = 'left' | 'center' | 'right'
export type SortDirection = 'asc' | 'desc'
export type TableMode = 'pagination' | 'lazy'
export type Theme = 'auto' | 'light' | 'dark'

export interface FilterOption {
  value: string
  label: ReactNode
}

export type FilterType = 'text' | 'select' | 'radio' | 'checkbox'

export interface Column<Row = any> {
  key?: string
  accessor?: string | ((row: Row) => unknown)
  header: ReactNode
  width?: number | string
  align?: Align
  sortable?: boolean
  sortFn?: (valueA: unknown, valueB: unknown, rowA: Row, rowB: Row) => number
  searchable?: boolean
  filterable?: boolean
  /**
   * Control rendered in the toolbar for this column's filter. Defaults to
   * `'select'` when `filterOptions` is given, otherwise `'text'`.
   * `'radio'` and `'checkbox'` also require `filterOptions`.
   */
  filterType?: FilterType
  filterOptions?: Array<string | FilterOption>
  render?: (value: unknown, row: Row, rowIndex: number) => ReactNode
}

export interface SearchConfig {
  visible?: boolean
  placeholder?: string
}

export interface FilterConfig {
  visible?: boolean
}

export interface PaginationConfig {
  visible?: boolean
  showPageSize?: boolean
  showPageNumbers?: boolean
  pageSizeOptions?: number[]
  initialPageSize?: number
}

export interface Action<Row = any> {
  key?: string
  label: ReactNode
  icon?: ReactNode
  onClick: (row: Row, rowIndex: number) => void
  danger?: boolean
  disabled?: (row: Row) => boolean
  hidden?: (row: Row) => boolean
}

export interface ExpandableConfig<Row = any> {
  multiple?: boolean
  isExpandable?: (row: Row) => boolean
  render: (row: Row, rowIndex: number) => ReactNode
}

export interface Sort {
  key: string
  direction: SortDirection
}

export type Filters = Record<string, unknown>

export function columnKey<Row>(column: Column<Row>): string {
  return column.key ?? (column.accessor as string)
}

export interface TableState {
  sort: Sort | null
  search: string
  filters: Filters
  page: number
  pageSize: number
}

export interface TableProps<Row = any> {
  columns: Column<Row>[]
  data: Row[]
  mode?: TableMode
  getRowId?: (row: Row, rowIndex: number) => string | number
  onRowClick?: (row: Row, rowIndex: number) => void
  emptyMessage?: ReactNode
  caption?: ReactNode
  'aria-label'?: string

  sortable?: boolean

  search?: SearchConfig
  filters?: FilterConfig

  pagination?: PaginationConfig

  actions?: Action<Row>[]
  actionColumnLabel?: ReactNode

  onStateChange?: (state: TableState) => void

  onLoadMore?: (state: Pick<TableState, 'search' | 'sort' | 'filters'>) => void | Promise<void>
  hasMore?: boolean
  loadingMore?: boolean

  theme?: Theme
  expandable?: ExpandableConfig<Row>

  className?: string
}

export interface TableContextValue<Row = any> {
  columns: Column<Row>[]
  actions: Action<Row>[]
  hasActionColumn: boolean
  actionColumnLabel: ReactNode
  getRowId?: (row: Row, rowIndex: number) => string | number
  onRowClick?: (row: Row, rowIndex: number) => void
  sortable: boolean
  mode: TableMode
  pagination: Required<Pick<PaginationConfig, 'visible' | 'showPageSize' | 'showPageNumbers' | 'pageSizeOptions' | 'initialPageSize'>>
  searchConfig: Required<SearchConfig>
  filterConfig: Required<FilterConfig>
  lazyLoadMore: () => Promise<void>
  hasMore: boolean
  loadingMore: boolean
  expandable: (Required<Pick<ExpandableConfig<Row>, 'multiple'>> & ExpandableConfig<Row>) | null
  hasExpandColumn: boolean
  isRowExpanded: (rowId: string | number) => boolean
  toggleRowExpanded: (rowId: string | number) => void

  sort: Sort | null
  search: string
  filters: Filters
  page: number
  pageSize: number
  rows: Row[]
  total: number
  toggleSort: (key: string) => void
  updateSearch: (value: string) => void
  updateFilter: (key: string, value: unknown) => void
  clearFilters: () => void
  goToPage: (page: number) => void
  updatePageSize: (size: number) => void
}
