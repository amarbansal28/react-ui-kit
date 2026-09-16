import { expect, test, type Locator, type Page } from '@playwright/test'

function sectionByHeading(page: Page, headingName: string): Locator {
  return page.getByRole('heading', { name: headingName, exact: true }).locator('xpath=..')
}

function paginationSection(page: Page): Locator {
  return sectionByHeading(page, 'Pagination mode')
}

function lazySection(page: Page): Locator {
  return sectionByHeading(page, 'Lazy-load mode')
}

function accordionSection(page: Page): Locator {
  return sectionByHeading(page, 'Accordion (expand for detail text)')
}

function childTableSection(page: Page): Locator {
  return sectionByHeading(page, 'Child table (expand for nested orders table)')
}

function bodyRows(table: Locator): Locator {
  return table.locator('tbody > tr')
}

test.beforeEach(async ({ page }) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') throw new Error(`Console error: ${msg.text()}`)
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Pagination mode' })).toBeVisible()
})

test.describe('Pagination mode table', () => {
  test('renders the full first page of rows', async ({ page }) => {
    const section = paginationSection(page)
    await expect(bodyRows(section)).toHaveCount(10)
    await expect(section.getByText('1–10 of 87')).toBeVisible()
  })

  test('searches across name and email', async ({ page }) => {
    const section = paginationSection(page)
    await section.getByPlaceholder('Search name or email…').fill('User 42')

    await expect(bodyRows(section)).toHaveCount(1)
    await expect(section.getByText('user42@example.com')).toBeVisible()
  })

  test('sorts by clicking a column header and toggles direction', async ({ page }) => {
    const section = paginationSection(page)
    const idHeader = section.locator('thead').getByRole('button', { name: 'ID' })

    await idHeader.click()
    await expect(bodyRows(section).first().locator('td').first()).toHaveText('1')

    await idHeader.click()
    await expect(bodyRows(section).first().locator('td').first()).toHaveText('87')
  })

  test('filters by status via the select control', async ({ page }) => {
    const section = paginationSection(page)
    await section.getByLabel('Filter by Status').selectOption('Pending')

    const rows = bodyRows(section)
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByText('Pending')).toBeVisible()
    }
  })

  test('navigates to the next page and updates the range', async ({ page }) => {
    const section = paginationSection(page)
    await section.getByRole('button', { name: 'Next page' }).click()

    await expect(section.getByText('11–20 of 87')).toBeVisible()
  })

  test('changes rows-per-page and re-paginates', async ({ page }) => {
    const section = paginationSection(page)
    await section.getByLabel('Rows per page').selectOption('25')

    await expect(bodyRows(section)).toHaveCount(25)
    await expect(section.getByText('1–25 of 87')).toBeVisible()
  })

  test('opens the row action menu and triggers an action', async ({ page }) => {
    const section = paginationSection(page)
    const firstRow = bodyRows(section).first()

    await firstRow.getByRole('button', { name: 'Row actions' }).click()
    const menu = section.getByRole('menu')
    await expect(menu).toBeVisible()

    let dialogMessage = ''
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message()
      void dialog.dismiss()
    })
    await section.getByRole('menuitem', { name: 'Edit' }).click()

    await expect.poll(() => dialogMessage).toContain('Edit User 1')
    await expect(menu).not.toBeVisible()
  })
})

test.describe('Lazy-load mode table', () => {
  test('loads more rows on demand and eventually shows "All rows loaded"', async ({ page }) => {
    const section = lazySection(page)
    await expect(bodyRows(section)).toHaveCount(15)

    await section.getByRole('button', { name: 'Load more' }).click()
    await expect(bodyRows(section)).toHaveCount(30)

    const loadMoreButton = section.getByRole('button', { name: 'Load more' })
    while (await loadMoreButton.isVisible()) {
      await loadMoreButton.click()
      await page.waitForTimeout(600)
    }

    await expect(section.getByText('All rows loaded')).toBeVisible()
    await expect(bodyRows(section)).toHaveCount(87)
  })
})

test.describe('Accordion expandable rows', () => {
  test('expands one row at a time (accordion behavior)', async ({ page }) => {
    const section = accordionSection(page)

    await section.getByRole('button', { name: 'Expand row' }).first().click()
    await expect(section.getByText(/User 1 has been a member since/)).toBeVisible()

    // Row 2's toggle: the accordion inserted an extra <tr> for row 1's expanded
    // panel, so re-query rather than reuse a stale index into the toggle list.
    await bodyRows(section).nth(2).getByRole('button', { name: 'Expand row' }).click()
    await expect(section.getByText(/User 2 has been a member since/)).toBeVisible()
    await expect(section.getByText(/User 1 has been a member since/)).not.toBeVisible()
  })
})

test.describe('Child table expandable rows', () => {
  test('expands a row to reveal a nested orders table, independently of other rows', async ({ page }) => {
    const section = childTableSection(page)
    const toggles = section.getByRole('button', { name: 'Expand row' })

    await toggles.nth(0).click()
    await toggles.nth(1).click()

    const nestedTables = section.locator('.table-expanded-panel table')
    await expect(nestedTables).toHaveCount(2)
  })
})

test.describe('Theming', () => {
  test('switching to dark theme applies data-table-theme to all tables', async ({ page }) => {
    await page.getByRole('button', { name: 'dark', exact: true }).click()

    const containers = page.locator('.table-container')
    const count = await containers.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(containers.nth(i)).toHaveAttribute('data-table-theme', 'dark')
    }
  })

  test('switching to light theme applies data-table-theme to all tables', async ({ page }) => {
    await page.getByRole('button', { name: 'light', exact: true }).click()

    const containers = page.locator('.table-container')
    await expect(containers.first()).toHaveAttribute('data-table-theme', 'light')
  })
})
