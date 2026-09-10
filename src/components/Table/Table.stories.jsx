import { useState } from 'react'
import { Table } from './Table'
import { makeRows, sampleColumns, orderColumns } from './Table.fixtures'

const ALL_ROWS = makeRows(87)

const STATUS_STYLES = {
  Active: { background: '#1f4d2e', color: '#7CFC00' },
  Pending: { background: '#4d3d1f', color: '#ffd27c' },
  Inactive: { background: '#4d1f1f', color: '#ff8c8c' },
}

const columnsWithStatusBadge = sampleColumns.map((column) =>
  column.key === 'status'
    ? {
        ...column,
        render: (value) => (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: '0.75rem',
              ...STATUS_STYLES[value],
            }}
          >
            {value}
          </span>
        ),
      }
    : column,
)

export default {
  title: 'Components/Table',
  component: Table,
  parameters: { layout: 'padded' },
  argTypes: {
    theme: { control: 'select', options: ['auto', 'light', 'dark'] },
    mode: { control: 'select', options: ['pagination', 'lazy'] },
  },
  args: {
    columns: columnsWithStatusBadge,
    data: ALL_ROWS,
    getRowId: (row) => row.id,
    theme: 'auto',
  },
}

export const Default = {}

export const WithSearchAndFilters = {
  args: {
    search: { visible: true, placeholder: 'Search name or email…' },
    filters: { visible: true },
  },
}

export const WithRowActions = {
  args: {
    actions: [
      { key: 'edit', label: 'Edit', onClick: (row) => alert(`Edit ${row.name}`) },
      { key: 'delete', label: 'Delete', danger: true, onClick: (row) => alert(`Delete ${row.name}`) },
    ],
  },
}

export const CustomPagination = {
  args: {
    pagination: {
      visible: true,
      showPageSize: true,
      showPageNumbers: true,
      pageSizeOptions: [5, 15, 30],
      initialPageSize: 5,
    },
  },
}

export const NoPagination = {
  args: {
    data: ALL_ROWS.slice(0, 8),
    pagination: { visible: false },
  },
}

export const LazyLoad = {
  render: (args) => {
    const PAGE = 15
    const [rows, setRows] = useState(ALL_ROWS.slice(0, PAGE))
    const [loading, setLoading] = useState(false)

    const loadMore = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setRows((prev) => ALL_ROWS.slice(0, prev.length + PAGE))
      setLoading(false)
    }

    return (
      <Table
        {...args}
        data={rows}
        mode="lazy"
        onLoadMore={loadMore}
        hasMore={rows.length < ALL_ROWS.length}
        loadingMore={loading}
      />
    )
  },
  args: {
    pagination: { visible: true },
    search: { visible: false },
    filters: { visible: false },
  },
}

export const AccordionExpandableRows = {
  name: 'Expandable rows — accordion',
  args: {
    columns: columnsWithStatusBadge.slice(0, 4),
    data: ALL_ROWS.slice(0, 10),
    search: { visible: false },
    filters: { visible: false },
    pagination: { visible: false },
    expandable: {
      render: (row) => <p style={{ margin: 0 }}>{row.bio}</p>,
    },
  },
}

export const ChildTableExpandableRows = {
  name: 'Expandable rows — nested child table',
  render: (args) => (
    <Table
      {...args}
      expandable={{
        multiple: true,
        isExpandable: (row) => row.orders.length > 0,
        render: (row) => (
          <Table
            theme={args.theme}
            columns={orderColumns}
            data={row.orders}
            getRowId={(order) => order.orderId}
            search={{ visible: false }}
            filters={{ visible: false }}
            pagination={{ visible: false }}
          />
        ),
      }}
    />
  ),
  args: {
    columns: columnsWithStatusBadge.slice(0, 4),
    data: ALL_ROWS.slice(0, 10),
    search: { visible: false },
    filters: { visible: false },
    pagination: { visible: false },
  },
}

export const DarkTheme = {
  args: {
    theme: 'dark',
    actions: [{ key: 'edit', label: 'Edit', onClick: (row) => alert(`Edit ${row.name}`) }],
  },
  parameters: { backgrounds: { default: 'dark' } },
}

export const EmptyState = {
  args: {
    data: [],
    emptyMessage: 'No users match your search.',
  },
}

export const WithCaption = {
  args: {
    caption: 'Registered users and their account status',
  },
}
