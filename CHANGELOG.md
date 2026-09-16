# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated visual regression testing via [Lost Pixel](https://www.lost-pixel.com) (`lostpixel.config.ts`, `npm run test:visual` / `test:visual:update`), snapshotting every Storybook story against git-committed baselines under `.lostpixel/baseline/`.
- Automated accessibility testing via `@axe-core/playwright` (`e2e/accessibility.spec.ts`, `npm run test:a11y`), checking WCAG 2.2 AA rules and a minimum 24×24px interactive target size across the demo app in its default, expanded-rows, action-menu-open, and dark-theme states.
- End-to-end tests via Playwright (`e2e/table.spec.ts`, `npm run test:e2e`) covering the demo's pagination, lazy-load, accordion/child-table expansion, row actions, and theming.
- Unit/component test suite via Vitest + Testing Library (`src/components/Table/*.test.{ts,tsx}`, `npm run test`), plus coverage reporting and enforced thresholds (`npm run test:coverage`).
- `LICENSE` file (MIT), `CHANGELOG.md`, and `package.json` metadata (`repository`, `bugs`, `homepage`, `author`).

### Changed
- Migrated the entire codebase (library, demo, Storybook config) from JavaScript/JSX to TypeScript, with `.d.ts` declarations now emitted to `dist/` for consumers.
- Renamed the npm package from `react-ui-kit` to `@amarbansal28/react-ui-kit` — the unscoped name was already taken on the public npm registry by an unrelated package.
- Fixed the `Table` demo/story fixtures (`Table.fixtures.ts`) to generate deterministic sample data instead of `Math.random()`, which was silently making every Lost Pixel run report false-positive diffs.
- Demo app (`demo/src/App.tsx`) now uses proper landmark structure (`<main>`, `<h1>`, `<section>`) and `aria-pressed` on the theme toggle, fixing 3 axe-core violations.
- `table.css`: the sortable-header click target and the row-actions kebab trigger now meet the WCAG 2.2 SC 2.5.8 minimum target size (24×24px) without changing their visible size.

## Earlier history

Prior to this changelog, the project shipped `Table` — a responsive data table with sorting, filtering, search, pagination/lazy-load, a configurable action-menu column, and expandable (accordion / nested table) rows — as JavaScript/JSX, along with its Storybook stories and a Vite-based demo app.
