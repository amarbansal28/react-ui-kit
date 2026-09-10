import { createContext, useContext } from 'react'

export const TableContext = createContext(null)

export function useTableContext() {
  const ctx = useContext(TableContext)
  if (!ctx) {
    throw new Error('Table subcomponents must be rendered inside a <Table>')
  }
  return ctx
}
