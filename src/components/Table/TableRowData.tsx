import type { ReactNode } from 'react'
import type { Column } from './types'

export interface TableRowDataProps<Row = any> {
  column: Column<Row>
  row: Row
  rowIndex: number
}

export function TableRowData<Row>({ column, row, rowIndex }: TableRowDataProps<Row>) {
  const value =
    typeof column.accessor === 'function' ? column.accessor(row) : row[(column.accessor ?? column.key) as keyof Row]

  return (
    <td
      className="table-cell"
      style={{ textAlign: column.align ?? 'left' }}
      data-column={column.key ?? column.accessor}
    >
      {column.render ? column.render(value, row, rowIndex) : (value as ReactNode)}
    </td>
  )
}
