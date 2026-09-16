import type { Column } from './types'

// Shared sample data/columns used by Table.stories.tsx (and available for
// reuse anywhere else example rows are useful, e.g. the demo app).
export const STATUS_OPTIONS = ['Active', 'Inactive', 'Pending']

export interface Order {
  orderId: string
  item: string
  quantity: number
  total: number
}

export interface UserRow {
  id: number
  name: string
  email: string
  status: string
  signupDate: string
  score: number
  bio: string
  orders: Order[]
}

export function makeRows(count: number): UserRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    status: STATUS_OPTIONS[i % STATUS_OPTIONS.length],
    signupDate: new Date(2024, i % 12, (i % 28) + 1).toISOString().slice(0, 10),
    score: Math.round(Math.random() * 1000),
    bio: `User ${i + 1} has been a member since ${new Date(2024, i % 12, (i % 28) + 1)
      .toISOString()
      .slice(0, 10)} and has placed ${(i % 5) + 1} orders so far.`,
    orders: Array.from({ length: (i % 5) + 1 }, (_, j) => ({
      orderId: `ORD-${i + 1}-${j + 1}`,
      item: ['Keyboard', 'Monitor', 'Mouse', 'Headset', 'Webcam'][(i + j) % 5],
      quantity: (j % 3) + 1,
      total: Math.round((j + 1) * 24.5 * 100) / 100,
    })),
  }))
}

export const sampleColumns: Column<UserRow>[] = [
  { key: 'id', header: 'ID', accessor: 'id', width: 60, sortable: true, searchable: false },
  { key: 'name', header: 'Name', accessor: 'name', sortable: true, searchable: true },
  { key: 'email', header: 'Email', accessor: 'email', sortable: true, searchable: true },
  {
    key: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    filterable: true,
    filterOptions: STATUS_OPTIONS,
  },
  { key: 'signupDate', header: 'Signup Date', accessor: 'signupDate', sortable: true, align: 'right' },
  { key: 'score', header: 'Score', accessor: 'score', sortable: true, align: 'right' },
]

export const orderColumns: Column<Order>[] = [
  { key: 'orderId', header: 'Order ID', accessor: 'orderId' },
  { key: 'item', header: 'Item', accessor: 'item', sortable: true },
  { key: 'quantity', header: 'Qty', accessor: 'quantity', align: 'right' },
  {
    key: 'total',
    header: 'Total',
    accessor: 'total',
    align: 'right',
    render: (value) => `$${(value as number).toFixed(2)}`,
  },
]
