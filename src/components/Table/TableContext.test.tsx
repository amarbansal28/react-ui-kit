import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTableContext } from './TableContext'

describe('useTableContext', () => {
  it('throws when used outside a <Table> provider', () => {
    expect(() => renderHook(() => useTableContext())).toThrow(
      'Table subcomponents must be rendered inside a <Table>',
    )
  })
})
