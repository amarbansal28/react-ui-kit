# react-ui-kit

A responsive, reusable React component library. It currently ships one component, `Table` — a data table with sorting, filtering, search, pagination or lazy-load, a configurable action-menu column, and expandable rows (accordion detail or nested child tables) — built to be extended with more components over time.

## Install

```bash
npm install @amarbansal28/react-ui-kit
```

`react` and `react-dom` (18 or 19) are peer dependencies.

## Quick start

```jsx
import { Table } from '@amarbansal28/react-ui-kit'
import '@amarbansal28/react-ui-kit/style.css'

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
| `caption` | `ReactNode` | `undefined` | Renders an HTML `<caption>` above the table, which also becomes its accessible name for screen readers. Recommended over `aria-label` when the caption text can be visible. |
| `aria-label` | `string` | `undefined` | Accessible name for the table when no visible `caption` is used. Ignored if `caption` is set (the caption already provides the accessible name). |

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

## Accessibility

- **Semantics**: real `<table>`/`<thead>`/`<tbody>`/`<th scope="col">` markup throughout; pass `caption` (or `aria-label`) to give the table an accessible name.
- **Sortable headers** are reachable by <kbd>Tab</kbd> and toggled with <kbd>Enter</kbd> or <kbd>Space</kbd>, with `aria-sort` kept in sync on the active column.
- **Clickable rows** (`onRowClick`) are focusable and activate with <kbd>Enter</kbd>/<kbd>Space</kbd>, matching mouse click behavior.
- **Row action menu**: the trigger exposes `aria-haspopup`/`aria-expanded`; opening it moves focus to the first item, <kbd>↑</kbd>/<kbd>↓</kbd>/<kbd>Home</kbd>/<kbd>End</kbd> navigate items, <kbd>Escape</kbd> or clicking outside closes it and returns focus to the trigger.
- **Expand toggle** (accordion / child table) is a real button with `aria-expanded` and an accessible label; decorative glyphs (chevrons, sort arrows, the kebab icon) are marked `aria-hidden`.
- **Live region**: a visually-hidden `aria-live="polite"` region announces the result count after search/filter/page changes, without wrapping the interactive table itself (which would cause it to be re-announced on every render).
- **Focus visibility**: all interactive controls (sort headers, buttons, inputs, selects, clickable rows) get a visible focus outline using the theme's accent color, so keyboard focus is never invisible in either theme.
- **Color contrast**: every text/background color pair in both themes (accent, danger, muted text) is verified to meet WCAG AA (≥4.5:1 for normal text).
- **Target size** (WCAG 2.2 SC 2.5.8, Level AA): every interactive control — sort headers, the row-actions trigger, the expand toggle, pagination buttons — has a hit target of at least 24×24 CSS px, even where the visible glyph is smaller.

Conformance target: **WCAG 2.2 Level AA**. Verified two ways:

- **Automated**: `@storybook/addon-a11y` runs `axe-core` against every story live in the Storybook UI (see below); `npm run test:a11y` runs the same `axe-core` ruleset (`wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`wcag22aa`) via Playwright against the running demo app, in its default state, with expandable rows open, with the row action menu open, and in dark theme — plus an explicit check that every interactive control meets the 24×24px target-size minimum. This runs as part of `npm run test:e2e` and is not just a Storybook-only check.
- **Manual**: keyboard-only navigation and contrast-ratio spot checks across both themes.

If you find an accessibility issue, please open one — it's treated as a bug, not a feature request.

## Storybook

Every story lives next to its component (`Table.stories.tsx`) and doubles as living documentation plus a visual/interaction testbed. The `@storybook/addon-a11y` addon runs `axe-core` against each story automatically (see the "Accessibility" tab in the Storybook UI).

```bash
npm run storybook         # http://localhost:6006
npm run build-storybook   # static build to storybook-static/
```

Stories cover: default rendering, search/filters, row actions, custom/no pagination, lazy-load, both expandable-row modes (accordion and nested child table), dark theme, empty state, and a captioned table. Add a new story by dropping a `<Component>.stories.tsx` next to any component under `src/components/`.

## Development

This repo builds the library from `src/` and includes a `demo/` Vite app (aliased to the local source) for interactive testing. The whole codebase — library, demo, and Storybook config — is TypeScript; the build emits `.d.ts` declarations to `dist/` alongside the JS bundles.

A Husky pre-commit hook (`.husky/pre-commit`) runs `lint-staged` (oxlint on staged `.ts`/`.tsx` files), `npm run typecheck`, and `npm test` before every commit — it runs automatically once you `npm install` (via the `prepare` script).

```
src/
  index.ts                  # package entry — re-exports every component
  components/
    Table/                 # one folder per component
      Table.tsx
      TableHeader.tsx
      TableRow.tsx
      TableRowData.tsx
      TableFooter.tsx
      TableToolbar.tsx
      Pagination.tsx
      ActionMenu.tsx
      TableContext.tsx
      useTableData.ts
      types.ts              # shared prop/column/context types
      table.css
      Table.fixtures.ts     # shared sample data/columns for stories
      Table.stories.tsx     # Storybook stories
      *.test.ts(x)          # unit/component tests, next to the code they cover
      index.ts              # component-level barrel export
demo/                        # Vite app for local dev/preview, not published
.storybook/                  # Storybook config (main.ts, preview.ts)
```

```bash
npm install
npm run dev               # demo app with HMR against local src/
npm run build              # builds the publishable library + .d.ts to dist/
npm run typecheck           # tsc --noEmit across src/ and demo/src/
npm run test                 # run the unit/component test suite once (Vitest)
npm run test:watch          # Vitest in watch mode
npm run test:coverage       # unit tests with coverage report + enforced thresholds
npm run test:e2e             # run end-to-end tests against the demo app (Playwright)
npm run test:e2e:ui         # Playwright's interactive UI mode
npm run test:a11y            # run just the axe-core/WCAG 2.2 AA checks (subset of test:e2e)
npm run test:visual          # build Storybook and check for visual regressions (Lost Pixel)
npm run test:visual:update  # same, then overwrite baselines with the new screenshots
npm run lint                # oxlint across src/ and demo/src/
npm run storybook           # Storybook dev server at :6006
npm run build-storybook    # static Storybook build
```

### Testing

Tests use [Vitest](https://vitest.dev) with [`@testing-library/react`](https://testing-library.com/react) and jsdom, configured in `vitest.config.ts` / `vitest.setup.ts`. Each `*.test.ts`/`*.test.tsx` file lives next to the component or hook it covers:

- `useTableData.test.ts` — sort/search/filter/pagination logic in isolation, via `renderHook`.
- `Table.test.tsx` — full component behavior: rendering, search, sort, filters, pagination, row clicks, row actions, expandable rows, lazy-load.
- `Pagination.test.tsx` — page-range display, page-number/ellipsis generation, disabled states, page-size changes.
- `ActionMenu.test.tsx` — menu open/close, keyboard navigation (arrows/Home/End/Escape), outside-click dismissal, disabled/hidden actions.
- `TableContext.test.tsx` — the compound-component guard rail (`useTableContext` throws when used outside a `<Table>`).

`npm run test:coverage` enforces minimum thresholds (95% statements/lines/functions, 80% branches — see `vitest.config.ts`) over `src/**/*.{ts,tsx}`, excluding stories, fixtures, type-only files, and the package entry point.

End-to-end tests use [Playwright](https://playwright.dev), configured in `playwright.config.ts`. `npm run test:e2e` starts the demo app (`npm run dev -- --port 5183`) automatically and drives it in a real headless Chromium browser; specs live under `e2e/`:

- `e2e/table.spec.ts` — covers the demo's four table instances end to end: pagination search/sort/filter/page-size/next-page, the row action menu (including the native `alert()` dialog it triggers), lazy-load's "Load more" through to "All rows loaded", accordion vs. independent row expansion, nested child tables, and light/dark theme switching. Also fails any test whose page logs a browser console error.
- `e2e/accessibility.spec.ts` — runs `@axe-core/playwright` (`wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`wcag22aa` rules) against the demo in its default state, with every expandable row open, with the row action menu open, and in dark theme, plus an explicit 24×24px minimum target-size check on every interactive control. See [Accessibility](#accessibility) above.

Playwright downloads its own Chromium binary on first run (`npx playwright install chromium` if it's not already cached).

Visual regression testing uses [Lost Pixel](https://www.lost-pixel.com) in its open-source, git-baseline mode (`lostpixel.config.ts`, `generateOnly: true` — no Lost Pixel Platform account or API key needed). It screenshots every `Table.stories.tsx` story from the built Storybook and pixel-diffs each one against a baseline:

- `npm run test:visual` — builds Storybook and runs Lost Pixel. Screenshots land in `.lostpixel/current/`, diffs (if any) in `.lostpixel/difference/`, both gitignored. Exits non-zero if any story differs from its baseline (`failOnDifference: true`).
- `npm run test:visual:update` — same, then copies the fresh screenshots over `.lostpixel/baseline/` — run this and commit the result whenever a story's appearance intentionally changes.
- `.lostpixel/baseline/*.png` **is committed** to the repo; that's the source of truth diffs are checked against.
- Lost Pixel bundles its own pinned Playwright/Chromium build, separate from the one `@playwright/test` uses for `e2e/`; if its first run errors with a missing-executable message, install it once via `node node_modules/lost-pixel/node_modules/playwright-core/cli.js install chromium`.
- Story fixtures (`Table.fixtures.ts`) are intentionally deterministic (no `Math.random()`) — any randomness there would make every run "diff" against the baseline even with no real change.

Adding a new component: create `src/components/<Name>/` with its own files, barrel export (`index.ts`), CSS, and a `<Name>.stories.tsx`; then add `export * from './components/<Name>'` to `src/index.ts`.
