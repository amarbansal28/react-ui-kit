import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

test.describe('Accessibility (WCAG 2.2 AA via axe-core)', () => {
  test('demo page has no violations in its default state', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Pagination mode' })).toBeVisible()

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('demo page has no violations with expandable rows open', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Pagination mode' })).toBeVisible()

    // Expanding a row inserts a new <tr> for its panel, which shifts every
    // subsequent toggle's index — so re-query from the end backward instead
    // of iterating a fixed index range over a live, shifting locator list.
    const initialCount = await page.getByRole('button', { name: 'Expand row' }).count()
    for (let i = initialCount - 1; i >= 0; i--) {
      await page.getByRole('button', { name: 'Expand row' }).nth(i).click()
    }

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('demo page has no violations with the row action menu open', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Pagination mode' })).toBeVisible()

    await page.getByRole('button', { name: 'Row actions' }).first().click()
    await expect(page.getByRole('menu')).toBeVisible()

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('demo page has no violations in dark theme', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'dark', exact: true }).click()
    await expect(page.locator('.table-container').first()).toHaveAttribute('data-table-theme', 'dark')

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('all interactive controls meet the 24x24px minimum target size (WCAG 2.2 SC 2.5.8)', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Pagination mode' })).toBeVisible()

    const selectors = [
      '.table-header-cell-content[role="button"]',
      '.table-action-menu-trigger',
      '.table-expand-toggle',
      '.table-pagination-btn',
    ]

    for (const selector of selectors) {
      const locator = page.locator(selector).first()
      if ((await locator.count()) === 0) continue
      const box = await locator.boundingBox()
      expect(box, `${selector} has no bounding box`).not.toBeNull()
      expect(box!.width, `${selector} width`).toBeGreaterThanOrEqual(24)
      expect(box!.height, `${selector} height`).toBeGreaterThanOrEqual(24)
    }
  })
})
