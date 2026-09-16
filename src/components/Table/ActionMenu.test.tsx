import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionMenu } from './ActionMenu'
import type { Action } from './types'

interface Row {
  id: number
  name: string
  archived: boolean
}

const row: Row = { id: 1, name: 'Alice', archived: false }

function actions(overrides: Partial<Action<Row>>[] = []): Action<Row>[] {
  const base: Action<Row>[] = [
    { key: 'edit', label: 'Edit', onClick: vi.fn() },
    { key: 'archive', label: 'Archive', onClick: vi.fn() },
    { key: 'delete', label: 'Delete', danger: true, onClick: vi.fn() },
  ]
  return base.map((a, i) => ({ ...a, ...overrides[i] }))
}

describe('<ActionMenu>', () => {
  it('renders nothing when there are no actions', () => {
    const { container } = render(<ActionMenu actions={[]} row={row} rowIndex={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when every action is hidden for the row', () => {
    const { container } = render(
      <ActionMenu actions={[{ label: 'Edit', onClick: vi.fn(), hidden: () => true }]} row={row} rowIndex={0} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('opens the menu on trigger click and focuses the first item', async () => {
    const user = userEvent.setup()
    render(<ActionMenu actions={actions()} row={row} rowIndex={0} />)

    await user.click(screen.getByRole('button', { name: 'Row actions' }))

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()
  })

  it('calls the action onClick with row and rowIndex, then closes the menu', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ActionMenu actions={[{ label: 'Edit', onClick }]} row={row} rowIndex={2} />)

    await user.click(screen.getByRole('button', { name: 'Row actions' }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(onClick).toHaveBeenCalledWith(row, 2)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('navigates items with ArrowDown/ArrowUp, wrapping at the ends', async () => {
    const user = userEvent.setup()
    render(<ActionMenu actions={actions()} row={row} rowIndex={0} />)

    await user.click(screen.getByRole('button', { name: 'Row actions' }))
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()
  })

  it('Home/End jump to the first/last item', async () => {
    const user = userEvent.setup()
    render(<ActionMenu actions={actions()} row={row} rowIndex={0} />)

    await user.click(screen.getByRole('button', { name: 'Row actions' }))
    await user.keyboard('{End}')
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()

    await user.keyboard('{Home}')
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<ActionMenu actions={actions()} row={row} rowIndex={0} />)

    const trigger = screen.getByRole('button', { name: 'Row actions' })
    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes when clicking outside the menu', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <ActionMenu actions={actions()} row={row} rowIndex={0} />
        <button type="button">outside</button>
      </div>,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'outside' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('disables an item for a row when disabled predicate returns true', async () => {
    const user = userEvent.setup()
    render(
      <ActionMenu
        actions={[{ label: 'Archive', onClick: vi.fn(), disabled: (r) => r.archived }]}
        row={{ ...row, archived: true }}
        rowIndex={0}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions' }))

    expect(screen.getByRole('menuitem', { name: 'Archive' })).toBeDisabled()
  })
})
