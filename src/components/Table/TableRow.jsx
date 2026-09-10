import { Fragment } from 'react'
import { useTableContext } from './TableContext'
import { TableRowData } from './TableRowData'
import { ActionMenu } from './ActionMenu'

export function TableRow({ row, rowIndex }) {
  const {
    columns,
    actions,
    hasActionColumn,
    getRowId,
    onRowClick,
    expandable,
    hasExpandColumn,
    isRowExpanded,
    toggleRowExpanded,
  } = useTableContext()

  const rowId = getRowId ? getRowId(row, rowIndex) : rowIndex
  const canExpand = hasExpandColumn && (expandable.isExpandable ? expandable.isExpandable(row) : true)
  const expanded = canExpand && isRowExpanded(rowId)
  const colSpan = columns.length + (hasActionColumn ? 1 : 0) + (hasExpandColumn ? 1 : 0)

  const handleRowKeyDown = onRowClick
    ? (event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onRowClick(row, rowIndex)
        }
      }
    : undefined

  return (
    <Fragment>
      <tr
        className={`table-row${onRowClick ? ' table-row--clickable' : ''}${expanded ? ' table-row--expanded' : ''}`}
        onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
        onKeyDown={handleRowKeyDown}
        tabIndex={onRowClick ? 0 : undefined}
        role={onRowClick ? 'button' : undefined}
        data-row-id={rowId}
      >
        {hasExpandColumn && (
          <td className="table-cell table-cell--expand" onClick={(e) => e.stopPropagation()}>
            {canExpand && (
              <button
                type="button"
                className={`table-expand-toggle${expanded ? ' table-expand-toggle--open' : ''}`}
                aria-label={expanded ? 'Collapse row' : 'Expand row'}
                aria-expanded={expanded}
                onClick={() => toggleRowExpanded(rowId)}
              >
                <span aria-hidden="true">›</span>
              </button>
            )}
          </td>
        )}
        {columns.map((column) => (
          <TableRowData key={column.key ?? column.accessor} column={column} row={row} rowIndex={rowIndex} />
        ))}
        {hasActionColumn && (
          <td className="table-cell table-cell--actions" onClick={(e) => e.stopPropagation()}>
            <ActionMenu actions={actions} row={row} rowIndex={rowIndex} />
          </td>
        )}
      </tr>
      {expanded && (
        <tr className="table-row-expanded-content">
          <td colSpan={colSpan}>
            <div className="table-expanded-panel">{expandable.render(row, rowIndex)}</div>
          </td>
        </tr>
      )}
    </Fragment>
  )
}
