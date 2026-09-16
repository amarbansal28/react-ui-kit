import type { ChangeEvent, ReactNode } from 'react'
import { columnKey } from './types'
import type { Column, FilterOption, FilterType } from './types'

export interface FilterControlProps<Row> {
  column: Column<Row>
  value: unknown
  onChange: (value: unknown) => void
}

function normalizeOption(option: string | FilterOption): { value: string; label: ReactNode } {
  return typeof option === 'object' ? option : { value: option, label: option }
}

function effectiveFilterType<Row>(column: Column<Row>): FilterType {
  if (column.filterType) return column.filterType
  return Array.isArray(column.filterOptions) ? 'select' : 'text'
}

/**
 * Renders the filter control for one column, dispatching on its effective
 * `filterType`. Shared by TableToolbar (filters.position: 'toolbar', the
 * default) and TableHeader (filters.position: 'header').
 */
export function FilterControl<Row>({ column, value, onChange }: FilterControlProps<Row>) {
  const filterType = effectiveFilterType(column)

  if (filterType === 'select') {
    return (
      <select
        className="table-filter-select"
        value={(value as string) ?? ''}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        aria-label={`Filter by ${column.header}`}
      >
        <option value="">All {column.header}</option>
        {(column.filterOptions ?? []).map((option) => {
          const { value: optValue, label: optLabel } = normalizeOption(option)
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          )
        })}
      </select>
    )
  }

  if (filterType === 'radio') {
    const groupName = `table-filter-radio-${columnKey(column)}`
    return (
      <fieldset className="table-filter-group">
        <legend className="table-filter-group-legend">Filter by {column.header}</legend>
        <label className="table-filter-group-option">
          <input
            type="radio"
            name={groupName}
            value=""
            checked={!value}
            onChange={() => onChange('')}
          />
          All
        </label>
        {(column.filterOptions ?? []).map((option) => {
          const { value: optValue, label: optLabel } = normalizeOption(option)
          return (
            <label key={optValue} className="table-filter-group-option">
              <input
                type="radio"
                name={groupName}
                value={optValue}
                checked={value === optValue}
                onChange={() => onChange(optValue)}
              />
              {optLabel}
            </label>
          )
        })}
      </fieldset>
    )
  }

  if (filterType === 'checkbox') {
    const selected = Array.isArray(value) ? (value as string[]) : []
    const toggle = (optValue: string) => {
      const next = selected.includes(optValue)
        ? selected.filter((v) => v !== optValue)
        : [...selected, optValue]
      onChange(next)
    }
    return (
      <fieldset className="table-filter-group">
        <legend className="table-filter-group-legend">Filter by {column.header}</legend>
        {(column.filterOptions ?? []).map((option) => {
          const { value: optValue, label: optLabel } = normalizeOption(option)
          return (
            <label key={optValue} className="table-filter-group-option">
              <input
                type="checkbox"
                checked={selected.includes(optValue)}
                onChange={() => toggle(optValue)}
              />
              {optLabel}
            </label>
          )
        })}
      </fieldset>
    )
  }

  return (
    <input
      type="text"
      className="table-filter-input"
      placeholder={`Filter ${column.header}`}
      value={(value as string) ?? ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      aria-label={`Filter by ${column.header}`}
    />
  )
}
