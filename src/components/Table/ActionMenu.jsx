import { useEffect, useRef, useState } from 'react'

export function ActionMenu({ actions, row, rowIndex }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const visibleActions = actions.filter((action) => !action.hidden?.(row))

  if (!visibleActions.length) return null

  return (
    <div className="table-action-menu" ref={menuRef}>
      <button
        type="button"
        className="table-action-menu-trigger"
        aria-label="Row actions"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        ⋮
      </button>
      {open && (
        <ul className="table-action-menu-list" role="menu">
          {visibleActions.map((action) => (
            <li key={action.key ?? action.label} role="none">
              <button
                type="button"
                role="menuitem"
                className={`table-action-menu-item${action.danger ? ' table-action-menu-item--danger' : ''}`}
                disabled={action.disabled?.(row)}
                onClick={() => {
                  setOpen(false)
                  action.onClick(row, rowIndex)
                }}
              >
                {action.icon && <span className="table-action-menu-item-icon">{action.icon}</span>}
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
