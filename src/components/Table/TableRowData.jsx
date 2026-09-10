export function TableRowData({ column, row, rowIndex }) {
  const value = typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor ?? column.key]

  return (
    <td
      className="table-cell"
      style={{ textAlign: column.align ?? 'left' }}
      data-column={column.key ?? column.accessor}
    >
      {column.render ? column.render(value, row, rowIndex) : value}
    </td>
  )
}
