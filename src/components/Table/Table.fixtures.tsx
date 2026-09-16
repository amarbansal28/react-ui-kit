import type { ReactNode } from 'react'
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

// Sample Arabic names, used only by the RTL-direction story/demo — a
// right-to-left script makes Column.dir's effect visually obvious in a way
// a `dir` attribute on Latin text would not.
const ARABIC_NAMES = ['محمد أحمد', 'فاطمة علي', 'يوسف حسن', 'مريم خالد', 'عمر سالم']

export interface UserRow {
  id: number
  name: string
  nameArabic: string
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
    nameArabic: ARABIC_NAMES[i % ARABIC_NAMES.length],
    email: `user${i + 1}@example.com`,
    status: STATUS_OPTIONS[i % STATUS_OPTIONS.length],
    signupDate: new Date(2024, i % 12, (i % 28) + 1).toISOString().slice(0, 10),
    score: (i * 137 + 29) % 1000,
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

interface BadgeStyle {
  background: string
  color: string
}

// Two palettes so consumers of this fixture (Storybook stories, the demo app)
// can render a status badge that's legible against both a light and a dark
// table surface — each story picks one fixed palette, while the demo's live
// theme toggle picks between them based on the currently active theme.
export const STATUS_BADGE_COLORS: { light: Record<string, BadgeStyle>; dark: Record<string, BadgeStyle> } = {
  light: {
    Active: { background: '#dcf3df', color: '#15662a' },
    Pending: { background: '#fbedd0', color: '#8a5a06' },
    Inactive: { background: '#fbdcdf', color: '#9c1f30' },
  },
  dark: {
    Active: { background: '#1f4d2e', color: '#7cfc00' },
    Pending: { background: '#4d3d1f', color: '#ffd27c' },
    Inactive: { background: '#4d1f1f', color: '#ff8c8c' },
  },
}

/**
 * Returns `sampleColumns` with the `status` column's `render` swapped for a
 * colored badge, using whichever palette matches `mode`. Shared by
 * Table.stories.tsx (each story picks a fixed mode) and the demo app (which
 * re-derives this on every theme change).
 */
export function withStatusBadge(columns: Column<UserRow>[], mode: 'light' | 'dark'): Column<UserRow>[] {
  const palette = STATUS_BADGE_COLORS[mode]
  return columns.map((column) =>
    column.key === 'status'
      ? {
          ...column,
          render: (value: unknown): ReactNode => {
            const style = palette[value as string]
            return (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  ...style,
                }}
              >
                {value as string}
              </span>
            )
          },
        }
      : column,
  )
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
