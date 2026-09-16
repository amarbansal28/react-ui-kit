import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'
import { makeRows, sampleColumns, orderColumns, withStatusBadge } from './Table.fixtures'
import type { Order, UserRow } from './Table.fixtures'

const ALL_ROWS = makeRows(87)

const lightColumns = withStatusBadge(sampleColumns, 'light')
const darkColumns = withStatusBadge(sampleColumns, 'dark')

const meta: Meta<typeof Table<UserRow>> = {
  title: 'Components/Table',
  component: Table,
  parameters: { layout: 'padded' },
  argTypes: {
    theme: { control: 'select', options: ['auto', 'light', 'dark'] },
    mode: { control: 'select', options: ['pagination', 'lazy'] },
  },
  args: {
    columns: lightColumns,
    data: ALL_ROWS,
    getRowId: (row) => row.id,
    theme: 'auto',
  },
}

export default meta

type Story = StoryObj<typeof Table<UserRow>>

export const Default: Story = {}

export const WithSearchAndFilters: Story = {
  args: {
    search: { visible: true, placeholder: 'Search name or email…' },
    filters: { visible: true },
  },
}

export const RadioFilter: Story = {
  name: 'Column filters — radio (single select)',
  args: {
    search: { visible: false },
    filters: { visible: true },
    columns: lightColumns.map((column) =>
      column.key === 'status' ? { ...column, filterType: 'radio' as const } : column,
    ),
  },
}

export const CheckboxFilter: Story = {
  name: 'Column filters — checkbox (multi-select, OR match)',
  args: {
    search: { visible: false },
    filters: { visible: true },
    columns: lightColumns.map((column) =>
      column.key === 'status' ? { ...column, filterType: 'checkbox' as const } : column,
    ),
  },
}

export const WithRowActions: Story = {
  args: {
    actions: [
      { key: 'edit', label: 'Edit', onClick: (row) => alert(`Edit ${row.name}`) },
      { key: 'delete', label: 'Delete', danger: true, onClick: (row) => alert(`Delete ${row.name}`) },
    ],
  },
}

export const CustomPagination: Story = {
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

export const NoPagination: Story = {
  args: {
    data: ALL_ROWS.slice(0, 8),
    pagination: { visible: false },
  },
}

function LazyLoadStory(args: React.ComponentProps<typeof Table<UserRow>>) {
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
}

export const LazyLoad: Story = {
  render: (args) => <LazyLoadStory {...args} />,
  args: {
    pagination: { visible: true },
    search: { visible: false },
    filters: { visible: false },
  },
}

export const AccordionExpandableRows: Story = {
  name: 'Expandable rows — accordion',
  args: {
    columns: lightColumns.slice(0, 4),
    data: ALL_ROWS.slice(0, 10),
    search: { visible: false },
    filters: { visible: false },
    pagination: { visible: false },
    expandable: {
      render: (row) => <p style={{ margin: 0 }}>{row.bio}</p>,
    },
  },
}

export const ChildTableExpandableRows: Story = {
  name: 'Expandable rows — nested child table',
  render: (args) => (
    <Table
      {...args}
      expandable={{
        multiple: true,
        isExpandable: (row) => row.orders.length > 0,
        render: (row) => (
          <Table<Order>
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
    columns: lightColumns.slice(0, 4),
    data: ALL_ROWS.slice(0, 10),
    search: { visible: false },
    filters: { visible: false },
    pagination: { visible: false },
  },
}

export const DarkTheme: Story = {
  args: {
    theme: 'dark',
    columns: darkColumns,
    actions: [{ key: 'edit', label: 'Edit', onClick: (row) => alert(`Edit ${row.name}`) }],
  },
  parameters: { backgrounds: { default: 'dark' } },
}

export const EmptyState: Story = {
  args: {
    data: [],
    emptyMessage: 'No users match your search.',
  },
}

export const WithCaption: Story = {
  args: {
    caption: 'Registered users and their account status',
  },
}
