import { createContext, useContext } from 'react'
import type { TableContextValue } from './types'

export const TableContext = createContext<TableContextValue | null>(null)

export function useTableContext<Row = any>(): TableContextValue<Row> {
  const ctx = useContext(TableContext)
  if (!ctx) {
    throw new Error('Table subcomponents must be rendered inside a <Table>')
  }
  return ctx as TableContextValue<Row>
}
