import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/MXbeats — Music Production and Arrangement Software/)

    const heading = page.getByText('Unlock your').first()

    await expect(heading).toHaveText('Unlock your')
    await expect(page.getByText('creativity').first()).toBeVisible()
  })
})
