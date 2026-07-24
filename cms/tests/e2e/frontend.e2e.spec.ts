import { test, expect } from '@playwright/test'

test.describe('CMS frontend shell', () => {
  test('homepage loads and links to admin', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Payload|Studio Stonehewer/i)

    const adminLink = page.getByRole('link', { name: /admin/i }).first()
    await expect(adminLink).toBeVisible()
  })
})
