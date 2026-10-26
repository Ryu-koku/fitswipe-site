import { test, expect } from '@playwright/test';

for (const width of [360, 390, 768, 1440]) {
  test(`layout and hierarchy at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('筋トレ入力を、サクッとスワイプ。');
    await expect(page.locator('.feature-label small')).toHaveText(['スワイプで記録', '成果グラフ', '友達共有']);
    const heights = await page.locator('.feature h3').evaluateAll(nodes => nodes.map(n => getComputedStyle(n).fontSize));
    expect(new Set(heights).size).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.hero [data-store]')).toHaveCount(0);
    await expect(page.locator('#download [data-store]')).toHaveCount(2);
    for (const element of await page.locator('.reveal-ready').all()) {
      await element.scrollIntoViewIfNeeded();
      await expect(element).not.toHaveClass(/reveal-pending/);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true, animations: 'disabled' });
  });
}
test('navigation and FAQ work without client-side JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('.feature').first()).toHaveCSS('opacity', '1');
  await page.getByRole('link', { name: '3つの特徴を見る' }).click();
  await expect(page).toHaveURL(/#features$/);
  await page.getByText('スワイプだけで記録できる？', { exact: true }).click();
  await expect(page.locator('.faq').first()).toHaveAttribute('open', '');
  await expect(page.locator('.faq').first().locator('p')).toBeVisible();
  await page.getByRole('link', { name: 'データの扱い', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('データの扱い');
  await context.close();
});
test('unconfigured distribution and support do not invent destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-store][aria-disabled="true"]')).toHaveCount(2);
  await expect(page.locator('a[data-store]')).toHaveCount(0);
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await page.goto('/support/');
  await expect(page.getByText('お問い合わせ窓口は準備中です。', { exact: false })).toBeVisible();
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});
test('no tracking, external requests, or browser console errors', async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4321') external.push(request.url()); });
  await page.goto('/');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await expect(page.locator('script[src]')).toHaveCount(1);
  await expect(page.locator('script:not([src])')).toHaveCount(0);
});
test('keyboard access and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '本文へスキップ' })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await expect(page.locator('.reveal-pending')).toHaveCount(0);
  await expect(page.locator('.feature').last()).toHaveCSS('opacity', '1');
});
