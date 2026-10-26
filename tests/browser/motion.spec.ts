import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('blocks fade and move into view once, without hiding the hero text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCSS('opacity', '1');
  const graph = page.locator('.feature--graph');
  await expect(graph).toHaveClass(/reveal-pending/);
  await expect(graph).toHaveCSS('opacity', '0');
  await graph.scrollIntoViewIfNeeded();
  await expect(graph).not.toHaveClass(/reveal-pending/);
  await expect(graph).toHaveCSS('opacity', '1');
  await expect(graph).toHaveCSS('transform', 'none');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await graph.scrollIntoViewIfNeeded();
  await expect(graph).toHaveCSS('opacity', '1');
  expect(await graph.evaluate(element => element.getAnimations().length)).toBe(0);
});

test('changing the motion preference immediately reveals all remaining blocks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.feature--friends')).toHaveClass(/reveal-pending/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.reveal-pending')).toHaveCount(0);
  await expect(page.locator('.feature--friends')).toHaveCSS('opacity', '1');
});

test('unsupported observers leave the complete page visible', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'IntersectionObserver', { value: undefined }));
  await page.goto('/');
  await expect(page.locator('.reveal-pending')).toHaveCount(0);
  await expect(page.locator('.feature').last()).toHaveCSS('opacity', '1');
});

test('keyboard focus reveals a pending FAQ immediately', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('.faq').first();
  await expect(faq).toHaveClass(/reveal-pending/);
  await faq.locator('summary').focus();
  await expect(faq).toHaveCSS('opacity', '1');
  await expect(faq).not.toHaveClass(/reveal-pending/);
});

test('external enhancement works with the actual Cloudflare script policy', async ({ page }) => {
  const headers = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');
  const policy = headers.match(/Content-Security-Policy: (.+)/)?.[1];
  expect(policy).toBeTruthy();
  const violations: string[] = [];
  page.on('console', message => { if (message.type() === 'error') violations.push(message.text()); });
  await page.route('http://127.0.0.1:4321/', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': policy! } });
  });
  await page.goto('/');
  const feature = page.locator('.feature--friends');
  await expect(feature).toHaveClass(/reveal-pending/);
  await feature.scrollIntoViewIfNeeded();
  await expect(feature).toHaveCSS('opacity', '1');
  expect(violations).toEqual([]);
});
