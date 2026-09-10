# react-ui-kit

A responsive, reusable React component library. It currently ships one component, `Table` — a data table with sorting, filtering, search, pagination or lazy-load, a configurable action-menu column, and expandable rows (accordion detail or nested child tables) — built to be extended with more components over time.

## Install

```bash
npm install react-ui-kit
```

`react` and `react-dom` (18 or 19) are peer dependencies.

## Quick start

```jsx
import { Table } from 'react-ui-kit'
import 'react-ui-kit/style.css'

const columns = [
  { key: 'name', header: 'Name', accessor: 'name', sortable: true, searchable: true },
  { key: 'status', header: 'Status', accessor: 'status', filterable: true, filterOptions: ['Active', 'Inactive'] },
]

function Example({ rows }) {
  return <Table columns={columns} data={rows} getRowId={(row) => row.id} />
}
```

## `<Table>` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `Column[]` | — (required) | Column definitions. See [Column shape](#column-shape) below. |
| `data` | `object[]` | — (required) | Rows to render. In `mode="pagination"` pass the **full** dataset (the table slices it client-side). In `mode="lazy"` pass only the rows currently loaded. |
| `mode` | `'pagination' \| 'lazy'` | `'pagination'` | `'pagination'`: sorting/filtering/search/paging all happen client-side over `data`. `'lazy'`: the table trusts `data` as-is (already filtered/sorted/paged by you) and shows a "Load more" control instead of page numbers — pair with `onLoadMore`. |
| `getRowId` | `(row, rowIndex) => string \| number` | `undefined` (falls back to `rowIndex`) | Stable row identity, used for React keys, expanded-row tracking, and the `data-row-id` attribute. Strongly recommended whenever rows can reorder, filter, or paginate. |
| `onRowClick` | `(row, rowIndex) => void` | `undefined` | Called when a row is clicked (outside the actions/expand cells). Adds a pointer cursor and `.table-row--clickable` class when set. |
| `emptyMessage` | `ReactNode` | `'No data available'` | Shown in place of rows when there's nothing to display. |
| `sortable` | `boolean` | `true` | Master switch for sorting. When `false`, no column sorts regardless of its own `sortable` flag. |
| `search` | `{ visible?, placeholder? }` | `{ visible: true, placeholder: 'Search…' }` | See [Search config](#search-config). |
| `filters` | `{ visible? }` | `{ visible: true }` | See [Filters config](#filters-config). |
| `pagination` | `PaginationConfig` | see below | See [Pagination config](#pagination-config). Ignored (only the lazy footer renders) when `mode="lazy"`. |
| `actions` | `Action[]` | `[]` | Adds a kebab-menu column. See [Actions](#actions). Omit or pass `[]` to hide the column entirely. |
| `actionColumnLabel` | `ReactNode` | `'Actions'` | Header label for the actions column. |
| `onStateChange` | `(state) => void` | `undefined` | Called after any sort/search/filter/page/pageSize change, with `{ sort, search, filters, page, pageSize }`. Useful for syncing state to the URL or for server-driven tables. |
| `onLoadMore` | `({ search, sort, filters }) => void \| Promise<void>` | `undefined` | Required for `mode="lazy"`. Called when the user clicks "Load more"; the table shows its own loading state while your promise resolves (or pass `loadingMore` yourself). |
| `hasMore` | `boolean` | `false` | `mode="lazy"` only — whether more rows exist. Hides the "Load more" button and shows "All rows loaded" when `false`. |
| `loadingMore` | `boolean` | `false` | `mode="lazy"` only — externally-controlled loading flag, OR'd with the table's own internal state while `onLoadMore` is pending. |
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | `'auto'` follows the OS/browser `prefers-color-scheme`. `'light'`/`'dark'` force a theme regardless of OS setting. |
| `expandable` | `ExpandableConfig` | `undefined` | Adds an expand-toggle column. See [Expandable rows](#expandable-rows-accordion--child-table). Omit to disable entirely. |
| `className` | `string` | `''` | Extra class name(s) appended to the root `.table-container` element. |

### Column shape

Each entry in `columns` is an object:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `key` | `string` | falls back to `accessor` | Unique column identifier. Used for sort/filter state and as the React key — required unless `accessor` is a plain string (then it's used as the key). |
| `accessor` | `string \| (row) => value` | — | Either a property name on the row object, or a function that derives the cell value from the row. |
| `header` | `ReactNode` | — | Column header content. |
| `width` | `number \| string` | `undefined` | Passed through to the `<th>`'s inline `width` style. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment for both the header and body cells. |
| `sortable` | `boolean` | `true` | Whether this column shows a sort toggle (also gated by the table-level `sortable` prop). |
| `sortFn` | `(valueA, valueB, rowA, rowB) => number` | natural string/number compare | Custom comparator, same contract as `Array.prototype.sort`. |
| `searchable` | `boolean` | `true` | Whether this column's value is checked by the global search box. |
| `filterable` | `boolean` | `false` | Whether this column gets a filter control in the toolbar. |
| `filterOptions` | `Array<string \| { value, label }>` | `undefined` | If provided, the filter renders as a `<select>` with these options. If omitted (but `filterable: true`), the filter renders as a free-text input matched case-insensitively. |
| `render` | `(value, row, rowIndex) => ReactNode` | identity | Custom cell renderer. `value` is whatever `accessor` produced. |

### Search config

```jsx
search={{ visible: true, placeholder: 'Search…' }}
```
Set `visible: false` to hide the search box entirely. A column is included in search matching unless it explicitly sets `searchable: false`.

### Filters config

```jsx
filters={{ visible: true }}
```
Set `visible: false` to hide the whole filter row, even if columns declare `filterable: true`. Only columns with `filterable: true` render a control; a "Clear filters" button appears automatically once any filter is active.

### Pagination config

```jsx
pagination={{
  visible: true,
  showPageSize: true,
  showPageNumbers: true,
  pageSizeOptions: [10, 25, 50, 100],
  initialPageSize: 10,
}}
```

| Field | Default | Description |
| --- | --- | --- |
| `visible` | `true` | Set `false` to hide the pagination footer (and, in `mode="pagination"`, render all rows on one "page"). |
| `showPageSize` | `true` | Show/hide the rows-per-page `<select>`. |
| `showPageNumbers` | `true` | Show/hide the numbered page buttons (prev/next/first/last always show when `visible`). |
| `pageSizeOptions` | `[10, 25, 50, 100]` | Options in the rows-per-page dropdown. An "All" option (page size `-1`) is always appended. |
| `initialPageSize` | `10` | Starting page size. |

### Actions

```jsx
actions={[
  { key: 'edit', label: 'Edit', onClick: (row, rowIndex) => {} },
  { key: 'delete', label: 'Delete', danger: true, onClick: (row) => {} },
  { key: 'archive', label: 'Archive', hidden: (row) => row.archived, disabled: (row) => !row.canArchive },
]}
```

Each action:

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | React key (falls back to `label`). |
| `label` | `ReactNode` | Menu item text. |
| `icon` | `ReactNode` | Optional leading icon. |
| `onClick` | `(row, rowIndex) => void` | Called when the item is chosen. |
| `danger` | `boolean` | Styles the item as a destructive action (red text). |
| `disabled` | `(row) => boolean` | Disable this item for specific rows. |
| `hidden` | `(row) => boolean` | Omit this item entirely for specific rows. |

The kebab-menu column only appears when `actions` has at least one entry; a row's menu is hidden entirely if every action is `hidden` for that row.

### Expandable rows (accordion / child table)

One config drives both an accordion-style detail panel and nested child tables — they're the same mechanism: a row expands to reveal `render()`'s output.

```jsx
expandable={{
  multiple: false,          // false = accordion (only one row open at a time); true = independently expandable rows
  isExpandable: (row) => row.hasDetails,  // optional; hide the toggle for rows that shouldn't expand
  render: (row, rowIndex) => <p>{row.bio}</p>,  // or return a nested <Table columns={...} data={row.children} />
}}
```

| Field | Default | Description |
| --- | --- | --- |
| `multiple` | `false` | `false`: expanding a row collapses any other expanded row (accordion behavior). `true`: rows expand/collapse independently (typical for child tables). |
| `isExpandable` | `() => true` | Return `false` to hide the expand toggle for a given row. |
| `render` | — (required) | Returns the content shown in the expanded panel. Return arbitrary JSX for accordion-style detail, or another `<Table>` for a child table — nesting works because `Table` is just a component. |

## Compound subcomponents

`Table` composes `TableHeader`, `TableRow`, `TableRowData`, `TableFooter`, and `TableToolbar` internally, and also exposes them as static properties (`Table.Header`, `Table.Row`, `Table.RowData`, `Table.Footer`, `Table.Toolbar`) and as named exports, for cases where you need to build custom layouts around the same table state. They read from the same internal context as `Table` and are not meant to be used standalone outside of it.

## Theming

All colors are CSS custom properties scoped to `.table-container`, with a light palette by default and a dark override (see [`theme`](#table-props) above). To customize the palette, override the variables on your own selector with higher specificity, e.g.:

```css
.table-container {
  --table-accent: #6366f1;
  --table-border: #e5e7eb;
}
```

See [`src/components/Table/table.css`](src/components/Table/table.css) for the full list of variables.

## Development

This repo builds the library from `src/` and includes a `demo/` Vite app (aliased to the local source) for interactive testing.

```
src/
  index.js                 # package entry — re-exports every component
  components/
    Table/                 # one folder per component
      Table.jsx
      TableHeader.jsx
      TableRow.jsx
      TableRowData.jsx
      TableFooter.jsx
      TableToolbar.jsx
      Pagination.jsx
      ActionMenu.jsx
      TableContext.jsx
      useTableData.js
      table.css
      index.js              # component-level barrel export
demo/                        # Vite app for local dev/preview, not published
```

```bash
npm install
npm run dev       # demo app with HMR against local src/
npm run build     # builds the publishable library to dist/
npm run lint      # oxlint across src/ and demo/src/
```

Adding a new component: create `src/components/<Name>/` with its own files, barrel export (`index.js`), and CSS; then add `export * from './components/<Name>'` to `src/index.js`.
