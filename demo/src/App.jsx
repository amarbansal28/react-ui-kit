import { useState } from 'react'
import { Table } from 'react-ui-kit'
import { makeRows, sampleColumns, orderColumns } from '../../src/components/Table/Table.fixtures'

const ALL_ROWS = makeRows(87)

const STATUS_STYLES = {
  Active: { background: '#1f4d2e', color: '#7CFC00' },
  Pending: { background: '#4d3d1f', color: '#ffd27c' },
  Inactive: { background: '#4d1f1f', color: '#ff8c8c' },
}

const columns = sampleColumns.map((column) =>
  column.key === 'status'
    ? {
        ...column,
        render: (value) => (
          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', ...STATUS_STYLES[value] }}>
            {value}
          </span>
        ),
      }
    : column,
)

function TableDemoPagination({ theme }) {
  return (
    <Table
      theme={theme}
      columns={columns}
      data={ALL_ROWS}
      mode="pagination"
      getRowId={(row) => row.id}
      search={{ visible: true, placeholder: 'Search name or email…' }}
      filters={{ visible: true }}
      pagination={{ visible: true, showPageSize: true, showPageNumbers: true, initialPageSize: 10 }}
      actions={[
        { key: 'edit', label: 'Edit', onClick: (row) => alert(`Edit ${row.name}`) },
        { key: 'delete', label: 'Delete', danger: true, onClick: (row) => alert(`Delete ${row.name}`) },
      ]}
    />
  )
}

function TableDemoLazy({ theme }) {
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
      theme={theme}
      columns={columns}
      data={rows}
      mode="lazy"
      getRowId={(row) => row.id}
      onLoadMore={loadMore}
      hasMore={rows.length < ALL_ROWS.length}
      loadingMore={loading}
      pagination={{ visible: true }}
      search={{ visible: false }}
      filters={{ visible: false }}
    />
  )
}

function TableDemoAccordion({ theme }) {
  return (
    <Table
      theme={theme}
      columns={columns.slice(0, 4)}
      data={ALL_ROWS.slice(0, 10)}
      mode="pagination"
      getRowId={(row) => row.id}
      search={{ visible: false }}
      filters={{ visible: false }}
      pagination={{ visible: false }}
      expandable={{
        render: (row) => <p style={{ margin: 0 }}>{row.bio}</p>,
      }}
    />
  )
}

function TableDemoChildTable({ theme }) {
  return (
    <Table
      theme={theme}
      columns={columns.slice(0, 4)}
      data={ALL_ROWS.slice(0, 10)}
      mode="pagination"
      getRowId={(row) => row.id}
      search={{ visible: false }}
      filters={{ visible: false }}
      pagination={{ visible: false }}
      expandable={{
        multiple: true,
        isExpandable: (row) => row.orders.length > 0,
        render: (row) => (
          <Table
            theme={theme}
            columns={orderColumns}
            data={row.orders}
            mode="pagination"
            getRowId={(order) => order.orderId}
            search={{ visible: false }}
            filters={{ visible: false }}
            pagination={{ visible: false }}
          />
        ),
      }}
    />
  )
}

const PAGE_BG = { auto: null, light: '#f4f5fa', dark: '#101018' }
const PAGE_TEXT = { auto: null, light: '#1a1a29', dark: '#f0f0f0' }

export default function App() {
  const [theme, setTheme] = useState('auto')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAGE_BG[theme] ?? undefined,
        color: PAGE_TEXT[theme] ?? undefined,
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
    >
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>Theme:</span>
          {['auto', 'light', 'dark'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 6,
                border: theme === t ? '2px solid #4c6fff' : '1px solid #888',
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                fontWeight: theme === t ? 600 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <h2>Pagination mode</h2>
          <TableDemoPagination theme={theme} />
        </div>
        <div>
          <h2>Lazy-load mode</h2>
          <TableDemoLazy theme={theme} />
        </div>
        <div>
          <h2>Accordion (expand for detail text)</h2>
          <TableDemoAccordion theme={theme} />
        </div>
        <div>
          <h2>Child table (expand for nested orders table)</h2>
          <TableDemoChildTable theme={theme} />
        </div>
      </div>
    </div>
  )
}
