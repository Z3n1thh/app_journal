import { test, expect } from '@playwright/test'

async function seedOnboarded(page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('bujo-profile', JSON.stringify({
      name: 'Test', onboarded: true, gender: 'other', language: 'en',
    }))
    localStorage.setItem('bujo-entries', '{}')
    localStorage.setItem('bujo-tour-done', '1')
  })
  await page.reload()
  await expect(page.locator('.app-shell')).toBeVisible({ timeout: 10000 })
}

test('app loads root element', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#root')).toBeVisible()
  await page.waitForTimeout(500)
  const content = await page.locator('#root').innerText()
  expect(content.length).toBeGreaterThan(0)
})

test('keyboard shortcut opens search from main app', async ({ page }) => {
  await seedOnboarded(page)
  await page.keyboard.press('/')
  await expect(page.locator('.search-page, .page')).toBeVisible({ timeout: 5000 })
  await expect(page.getByRole('heading', { name: /search/i })).toBeVisible({ timeout: 5000 })
})

test('log today opens day modal', async ({ page }) => {
  await seedOnboarded(page)
  await page.getByRole('button', { name: /log today/i }).first().click()
  await expect(page.locator('.day-modal, .modal')).toBeVisible({ timeout: 5000 })
})

test('save mood for today then reopen', async ({ page }) => {
  await seedOnboarded(page)
  await page.getByRole('button', { name: /log today/i }).first().click()
  await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 })
  const moodBtn = page.locator('.mood-btn').first()
  await moodBtn.click()
  await page.getByRole('button', { name: /save/i }).click()
  await expect(page.locator('.modal')).toHaveCount(0, { timeout: 5000 })
  await page.getByRole('button', { name: /log today/i }).first().click()
  await expect(page.locator('.mood-btn.selected, .mood-btn[aria-pressed="true"]').first()).toBeVisible({ timeout: 5000 })
})

test('navigate between calendar week and insights', async ({ page }) => {
  await seedOnboarded(page)
  await page.locator('.side-nav-item').filter({ hasText: /week/i }).click()
  await expect(page.getByRole('heading', { name: 'Weekly spread' })).toBeVisible({ timeout: 5000 })
  await page.locator('.side-nav-item').filter({ hasText: /insights/i }).click()
  await expect(page.locator('.page-title').filter({ hasText: /insights/i })).toBeVisible({ timeout: 5000 })
  await page.locator('.side-nav-item').filter({ hasText: /calendar/i }).click()
  await expect(page.locator('#calendar-export')).toBeVisible({ timeout: 5000 })
})
