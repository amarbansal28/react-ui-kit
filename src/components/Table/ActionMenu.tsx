import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Action } from './types'

export interface ActionMenuProps<Row = any> {
  actions: Action<Row>[]
  row: Row
  rowIndex: number
}

export function ActionMenu<Row>({ actions, row, rowIndex }: ActionMenuProps<Row>) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const visibleActions = actions.filter((action) => !action.hidden?.(row))

  const closeMenu = (focusTrigger = true) => {
    setOpen(false)
    if (focusTrigger) triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return undefined
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus()
  }, [open])

  if (!visibleActions.length) return null

  const focusItem = (index: number) => {
    const item = itemRefs.current[index]
    item?.focus()
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const currentIndex = itemRefs.current.findIndex((el) => el === document.activeElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusItem((currentIndex + 1) % visibleActions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusItem((currentIndex - 1 + visibleActions.length) % visibleActions.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusItem(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusItem(visibleActions.length - 1)
    } else if (event.key === 'Tab') {
      closeMenu(false)
    }
  }

  return (
    <div className="table-action-menu" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        className="table-action-menu-trigger"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span aria-hidden="true">⋮</span>
      </button>
      {open && (
        <ul className="table-action-menu-list" role="menu" onKeyDown={handleMenuKeyDown}>
          {visibleActions.map((action, index) => (
            <li key={action.key ?? index} role="none">
              <button
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={`table-action-menu-item${action.danger ? ' table-action-menu-item--danger' : ''}`}
                disabled={action.disabled?.(row)}
                onClick={() => {
                  closeMenu()
                  action.onClick(row, rowIndex)
                }}
              >
                {action.icon && (
                  <span className="table-action-menu-item-icon" aria-hidden="true">
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
