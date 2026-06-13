import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('renders 9 empty cells', async ({ page }) => {
  const cells = page.locator('[aria-label^="Cell"]')
  await expect(cells).toHaveCount(9)
  for (const cell of await cells.all()) {
    await expect(cell).toHaveText('')
  }
})

test('PvP: places X then O alternately', async ({ page }) => {
  await page.click('text=2 Players')
  const cells = page.locator('[aria-label^="Cell"]')
  await cells.nth(0).click()
  await expect(cells.nth(0)).toHaveText('X')
  await cells.nth(1).click()
  await expect(cells.nth(1)).toHaveText('O')
})

test('PvP: X wins on row 0 — shows winner status', async ({ page }) => {
  await page.click('text=2 Players')
  const cells = page.locator('[aria-label^="Cell"]')
  await cells.nth(0).click() // X
  await cells.nth(3).click() // O
  await cells.nth(1).click() // X
  await cells.nth(4).click() // O
  await cells.nth(2).click() // X wins
  await expect(page.locator('.status')).toContainText(/Player X Wins/i)
})

test('PvP: draw game shows draw status', async ({ page }) => {
  await page.click('text=2 Players')
  const cells = page.locator('[aria-label^="Cell"]')
  const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]
  for (const i of moves) await cells.nth(i).click()
  await expect(page.locator('.status')).toContainText(/draw/i)
})

test('New Game resets board', async ({ page }) => {
  await page.click('text=2 Players')
  await page.locator('[aria-label^="Cell"]').nth(0).click()
  await page.click('text=New Game')
  await expect(page.locator('[aria-label^="Cell"]').nth(0)).toHaveText('')
})

test('score increments after win', async ({ page }) => {
  await page.click('text=2 Players')
  const cells = page.locator('[aria-label^="Cell"]')
  await cells.nth(0).click()
  await cells.nth(3).click()
  await cells.nth(1).click()
  await cells.nth(4).click()
  await cells.nth(2).click()
  const scores = page.locator('.score-value')
  await expect(scores.first()).toHaveText('1')
})

test('PvC: AI responds after human move', async ({ page }) => {
  await page.click('text=vs AI')
  await page.locator('[aria-label^="Cell"]').nth(4).click()
  // wait for AI 400ms + buffer
  await page.waitForTimeout(800)
  const filled = await page.locator('[aria-label^="Cell"]').filter({ hasText: /X|O/ }).count()
  expect(filled).toBeGreaterThanOrEqual(2)
})

test('theme toggle switches dark ↔ light', async ({ page }) => {
  const html = page.locator('html')
  const before = await html.getAttribute('data-theme')
  await page.click('[aria-label*="Switch to"]')
  const after = await html.getAttribute('data-theme')
  expect(before).not.toBe(after)
})
