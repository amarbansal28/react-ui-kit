import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('<Pagination>', () => {
  it('shows the current range and total', () => {
    render(
      <Pagination page={2} pageSize={10} total={35} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />,
    )

    expect(screen.getByText('11–20 of 35')).toBeInTheDocument()
  })

  it('shows "No results" when total is 0', () => {
    render(<Pagination page={1} pageSize={10} total={0} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)

    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('disables first/previous on page 1 and last/next on the final page', () => {
    render(<Pagination page={1} pageSize={10} total={10} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled()
  })

  it('collapses distant page numbers into an ellipsis', () => {
    render(<Pagination page={5} pageSize={10} total={200} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)

    const controls = screen.getByText('4').closest('.table-pagination-controls')!
    const labels = Array.from(controls.querySelectorAll('button, span')).map((el) => el.textContent)

    expect(labels).toEqual(['«', '‹', '1', '…', '4', '5', '6', '…', '20', '›', '»'])
  })

  it('calls onPageChange with the target page when a page number is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <Pagination page={1} pageSize={10} total={30} onPageChange={onPageChange} onPageSizeChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: '3' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageSizeChange with a numeric value from the select', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(
      <Pagination page={1} pageSize={10} total={30} onPageChange={vi.fn()} onPageSizeChange={onPageSizeChange} />,
    )

    await user.selectOptions(screen.getByLabelText('Rows per page'), '25')

    expect(onPageSizeChange).toHaveBeenCalledWith(25)
  })

  it('hides the page-size control when showPageSize is false', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={30}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        showPageSize={false}
      />,
    )

    expect(screen.queryByLabelText('Rows per page')).not.toBeInTheDocument()
  })

  it('hides numbered page buttons when showPageNumbers is false', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={30}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        showPageNumbers={false}
      />,
    )

    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument()
  })

  it('treats pageSize -1 as a single page containing all rows', () => {
    render(<Pagination page={1} pageSize={-1} total={57} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)

    expect(screen.getByText('1–57 of 57')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })
})
