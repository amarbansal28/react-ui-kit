import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Table } from './Table'
import type { Column } from './types'

interface Row {
  id: number
  name: string
  status: string
}

const columns: Column<Row>[] = [
  { key: 'id', header: 'ID', accessor: 'id' },
  { key: 'name', header: 'Name', accessor: 'name', sortable: true },
  { key: 'status', header: 'Status', accessor: 'status', filterable: true, filterOptions: ['Active', 'Inactive'] },
]

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    status: i % 2 === 0 ? 'Active' : 'Inactive',
  }))
}

function bodyRows(): HTMLTableRowElement[] {
  const tbody = screen.getByRole('table').querySelector('tbody')!
  return Array.from(tbody.querySelectorAll<HTMLTableRowElement>(':scope > tr'))
}

describe('<Table>', () => {
  it('renders one row per data item with the right cell values', () => {
    render(<Table columns={columns} data={makeRows(3)} getRowId={(r) => r.id} />)

    const rows = bodyRows()
    expect(rows).toHaveLength(3)
    expect(within(rows[0]).getByText('User 1')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Active')).toBeInTheDocument()
  })

  it('applies a column\'s dir to both its header cell and its body cells', () => {
    const dirColumns: Column<Row>[] = [
      { key: 'id', header: 'ID', accessor: 'id' },
      { key: 'name', header: 'الاسم', accessor: 'name', dir: 'rtl' },
    ]
    render(<Table columns={dirColumns} data={makeRows(2)} getRowId={(r) => r.id} />)

    const headerCell = screen.getByRole('columnheader', { name: 'الاسم' })
    expect(headerCell).toHaveAttribute('dir', 'rtl')

    const bodyCell = screen.getByText('User 1').closest('td')!
    expect(bodyCell).toHaveAttribute('dir', 'rtl')
  })

  it('leaves dir unset on columns that do not specify one', () => {
    render(<Table columns={columns} data={makeRows(1)} getRowId={(r) => r.id} />)

    const idHeaderCell = screen.getByRole('columnheader', { name: 'ID' })
    expect(idHeaderCell).not.toHaveAttribute('dir')
  })

  it('shows the empty message when there is no data', () => {
    render(<Table columns={columns} data={[]} emptyMessage="Nothing here" />)

    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('filters rows by the search box', async () => {
    const user = userEvent.setup()
    render(<Table columns={columns} data={makeRows(5)} getRowId={(r) => r.id} />)

    await user.type(screen.getByRole('searchbox'), 'User 3')

    const rows = bodyRows()
    expect(rows).toHaveLength(1)
    expect(within(rows[0]).getByText('User 3')).toBeInTheDocument()
  })

  it('sorts rows when a sortable column header is clicked, toggling direction', async () => {
    const user = userEvent.setup()
    render(<Table columns={columns} data={makeRows(3)} getRowId={(r) => r.id} pagination={{ visible: false }} />)

    const nameHeader = screen.getByText('Name')
    await user.click(nameHeader)
    expect(bodyRows().map((r) => within(r).getAllByRole('cell')[1].textContent)).toEqual([
      'User 1',
      'User 2',
      'User 3',
    ])

    await user.click(nameHeader)
    expect(bodyRows().map((r) => within(r).getAllByRole('cell')[1].textContent)).toEqual([
      'User 3',
      'User 2',
      'User 1',
    ])
  })

  it('filters rows via a column filter control', async () => {
    const user = userEvent.setup()
    render(<Table columns={columns} data={makeRows(4)} getRowId={(r) => r.id} pagination={{ visible: false }} />)

    await user.selectOptions(screen.getByLabelText('Filter by Status'), 'Inactive')

    const rows = bodyRows()
    expect(rows).toHaveLength(2)
    rows.forEach((row) => expect(within(row).getByText('Inactive')).toBeInTheDocument())
  })

  it('filters rows via a radio-group filter, one value at a time', async () => {
    const user = userEvent.setup()
    const radioColumns: Column<Row>[] = [
      ...columns.filter((c) => c.key !== 'status'),
      { key: 'status', header: 'Status', accessor: 'status', filterable: true, filterType: 'radio', filterOptions: ['Active', 'Inactive'] },
    ]
    render(<Table columns={radioColumns} data={makeRows(4)} getRowId={(r) => r.id} pagination={{ visible: false }} />)

    await user.click(screen.getByRole('radio', { name: 'Inactive' }))
    expect(bodyRows()).toHaveLength(2)

    await user.click(screen.getByRole('radio', { name: 'All' }))
    expect(bodyRows()).toHaveLength(4)
  })

  it('filters rows via a checkbox-group filter, matching any checked value, with object-form options', async () => {
    const user = userEvent.setup()
    const statusColumns: Column<Row>[] = [
      { key: 'id', header: 'ID', accessor: 'id' },
      { key: 'name', header: 'Name', accessor: 'name' },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        filterable: true,
        filterType: 'checkbox',
        filterOptions: [
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Pending', label: 'Pending' },
        ],
      },
    ]
    const rows: Row[] = [
      { id: 1, name: 'User 1', status: 'Active' },
      { id: 2, name: 'User 2', status: 'Inactive' },
      { id: 3, name: 'User 3', status: 'Pending' },
    ]
    render(<Table columns={statusColumns} data={rows} getRowId={(r) => r.id} pagination={{ visible: false }} />)

    await user.click(screen.getByRole('checkbox', { name: 'Active' }))
    expect(bodyRows()).toHaveLength(1)

    await user.click(screen.getByRole('checkbox', { name: 'Pending' }))
    expect(bodyRows()).toHaveLength(2)

    await user.click(screen.getByRole('checkbox', { name: 'Active' }))
    expect(bodyRows()).toHaveLength(1)
    expect(within(bodyRows()[0]).getByText('User 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(bodyRows()).toHaveLength(3)
  })

  it('renders no toolbar at all when search is hidden, filters are header-positioned, and none are active', () => {
    render(
      <Table
        columns={columns}
        data={makeRows(2)}
        getRowId={(r) => r.id}
        search={{ visible: false }}
        filters={{ position: 'header' }}
      />,
    )

    expect(document.querySelector('.table-toolbar')).not.toBeInTheDocument()
  })

  it('renders filter controls under column headers instead of the toolbar when filters.position is "header"', () => {
    render(
      <Table
        columns={columns}
        data={makeRows(2)}
        getRowId={(r) => r.id}
        filters={{ position: 'header' }}
      />,
    )

    expect(screen.queryByLabelText('Filter by Status')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()

    const filterSelect = screen.getByLabelText('Filter by Status')
    const headerFilterRow = filterSelect.closest('tr')!
    expect(headerFilterRow.closest('thead')).not.toBeNull()
  })

  it('filters rows from a header-positioned filter control and shows Clear filters in the toolbar once active', async () => {
    const user = userEvent.setup()
    render(
      <Table
        columns={columns}
        data={makeRows(4)}
        getRowId={(r) => r.id}
        filters={{ position: 'header' }}
        pagination={{ visible: false }}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Filter by Status'), 'Inactive')

    expect(bodyRows()).toHaveLength(2)
    const clearButton = screen.getByRole('button', { name: 'Clear filters' })
    expect(clearButton.closest('.table-toolbar')).not.toBeNull()

    await user.click(clearButton)
    expect(bodyRows()).toHaveLength(4)
  })

  it('paginates data and updates the visible page', async () => {
    const user = userEvent.setup()
    render(
      <Table
        columns={columns}
        data={makeRows(25)}
        getRowId={(r) => r.id}
        pagination={{ initialPageSize: 10 }}
      />,
    )

    expect(bodyRows()).toHaveLength(10)
    expect(screen.getByText('1–10 of 25')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next page' }))

    expect(screen.getByText('11–20 of 25')).toBeInTheDocument()
  })

  it('calls onRowClick with the row and index when a row is clicked', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(<Table columns={columns} data={makeRows(2)} getRowId={(r) => r.id} onRowClick={onRowClick} />)

    await user.click(bodyRows()[1])

    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }), 1)
  })

  it('activates a clickable row with Enter or Space when it has keyboard focus', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(<Table columns={columns} data={makeRows(2)} getRowId={(r) => r.id} onRowClick={onRowClick} />)

    bodyRows()[0].focus()
    await user.keyboard('{Enter}')
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 0)

    bodyRows()[1].focus()
    await user.keyboard(' ')
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }), 1)
  })

  it('does not activate a clickable row when Enter is pressed on a child element (e.g. inside the action menu)', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <Table
        columns={columns}
        data={makeRows(1)}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
        actions={[{ key: 'edit', label: 'Edit', onClick: vi.fn() }]}
      />,
    )

    screen.getByRole('button', { name: 'Row actions' }).focus()
    await user.keyboard('{Enter}')

    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('toggles sort with Enter or Space when a sort header has keyboard focus', async () => {
    const user = userEvent.setup()
    render(<Table columns={columns} data={makeRows(3)} getRowId={(r) => r.id} pagination={{ visible: false }} />)

    const nameHeaderButton = screen.getByRole('button', { name: 'Name' })
    const nameHeaderCell = nameHeaderButton.closest('th')!
    nameHeaderButton.focus()

    await user.keyboard('{Enter}')
    expect(nameHeaderCell).toHaveAttribute('aria-sort', 'ascending')

    await user.keyboard(' ')
    expect(nameHeaderCell).toHaveAttribute('aria-sort', 'descending')
  })

  it('renders a kebab action menu and invokes the chosen action with the row', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <Table
        columns={columns}
        data={makeRows(1)}
        getRowId={(r) => r.id}
        actions={[{ key: 'edit', label: 'Edit', onClick: onEdit }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions' }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 0)
  })

  it('hides an action for rows for which it is marked hidden', async () => {
    const user = userEvent.setup()
    render(
      <Table
        columns={columns}
        data={makeRows(2)}
        getRowId={(r) => r.id}
        actions={[{ key: 'edit', label: 'Edit', onClick: vi.fn(), hidden: (row) => row.id === 1 }]}
      />,
    )

    const rows = bodyRows()
    expect(within(rows[0]).queryByRole('button', { name: 'Row actions' })).not.toBeInTheDocument()

    await user.click(within(rows[1]).getByRole('button', { name: 'Row actions' }))
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
  })

  it('expands a row to show accordion detail content, collapsing others when multiple is false', async () => {
    const user = userEvent.setup()
    render(
      <Table
        columns={columns}
        data={makeRows(2)}
        getRowId={(r) => r.id}
        expandable={{ render: (row) => <p>Detail for {row.name}</p> }}
      />,
    )

    const toggles = screen.getAllByRole('button', { name: 'Expand row' })
    await user.click(toggles[0])
    expect(screen.getByText('Detail for User 1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand row' }))
    expect(screen.getByText('Detail for User 2')).toBeInTheDocument()
    expect(screen.queryByText('Detail for User 1')).not.toBeInTheDocument()
  })

  it('shows a "Load more" control in lazy mode and calls onLoadMore', async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn().mockResolvedValue(undefined)
    render(
      <Table
        columns={columns}
        data={makeRows(2)}
        getRowId={(r) => r.id}
        mode="lazy"
        onLoadMore={onLoadMore}
        hasMore
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Load more' }))

    expect(onLoadMore).toHaveBeenCalled()
  })

  it('shows "All rows loaded" instead of the load-more button once hasMore is false', () => {
    render(<Table columns={columns} data={makeRows(2)} mode="lazy" onLoadMore={vi.fn()} hasMore={false} />)

    expect(screen.getByText('All rows loaded')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('hides the lazy-mode footer entirely when pagination.visible is false', () => {
    render(
      <Table
        columns={columns}
        data={makeRows(2)}
        mode="lazy"
        onLoadMore={vi.fn()}
        hasMore
        pagination={{ visible: false }}
      />,
    )

    expect(screen.queryByText('All rows loaded')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('renders a free-text filter input for a filterable column without filterOptions', async () => {
    const user = userEvent.setup()
    const freeTextColumns: Column<Row>[] = [
      ...columns.filter((c) => c.key !== 'status'),
      { key: 'status', header: 'Status', accessor: 'status', filterable: true },
    ]
    render(<Table columns={freeTextColumns} data={makeRows(4)} getRowId={(r) => r.id} pagination={{ visible: false }} />)

    await user.type(screen.getByLabelText('Filter by Status'), 'Inactive')

    const rows = bodyRows()
    expect(rows).toHaveLength(2)
    rows.forEach((row) => expect(within(row).getByText('Inactive')).toBeInTheDocument())
  })

  it('derives a cell value from a function accessor and uses column.render when provided', () => {
    const derivedColumns: Column<Row>[] = [
      { key: 'id', header: 'ID', accessor: 'id' },
      {
        key: 'summary',
        header: 'Summary',
        accessor: (row) => `${row.name} (${row.status})`,
        render: (value) => <strong>{value as string}</strong>,
      },
    ]
    render(<Table columns={derivedColumns} data={makeRows(1)} getRowId={(r) => r.id} />)

    const cell = screen.getByText('User 1 (Active)')
    expect(cell.tagName).toBe('STRONG')
  })
})
