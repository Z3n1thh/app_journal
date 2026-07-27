import { test, expect } from '@playwright/test'

test('app loads root element', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#root')).toBeVisible()
  await page.waitForTimeout(500)
  const content = await page.locator('#root').innerText()
  expect(content.length).toBeGreaterThan(0)
})

test('keyboard shortcut opens search from main app', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('bujo-profile', JSON.stringify({ name: 'Test', onboarded: true, gender: 'other' }))
    localStorage.setItem('bujo-entries', '{}')
  })
  await page.reload()
  await page.keyboard.press('/')
  await expect(page.locator('.search-page, .page')).toBeVisible({ timeout: 5000 })
})
