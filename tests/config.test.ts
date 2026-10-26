import test from 'node:test';
import assert from 'node:assert/strict';
import { siteOrigin, storeUrl, supportEmail } from '../src/lib/config.ts';

test('empty configuration does not invent links', () => {
  assert.equal(storeUrl('', 'apple'), undefined);
  assert.equal(storeUrl(undefined, 'google'), undefined);
  assert.equal(supportEmail(''), undefined);
  assert.equal(siteOrigin(''), undefined);
});
test('accepts only HTTPS app listing URLs on official hosts', () => {
  assert.equal(storeUrl('https://apps.apple.com/jp/app/fitswipe/id123456789', 'apple'), 'https://apps.apple.com/jp/app/fitswipe/id123456789');
  assert.equal(storeUrl('https://play.google.com/store/apps/details?id=dev.local.fitlogsolo', 'google'), 'https://play.google.com/store/apps/details?id=dev.local.fitlogsolo');
  assert.equal(storeUrl('https://apps.apple.com/app/id12345', 'apple'), 'https://apps.apple.com/app/id12345');
});
test('rejects unsafe and non-listing store URLs', () => {
  for (const url of ['javascript:alert(1)', 'https://evil.test/app/id123', 'https://apps.apple.com.evil.test/app/id123', 'http://apps.apple.com/app/id123', 'https://user@apps.apple.com/app/id123', 'https://apps.apple.com/', 'https://apps.apple.com:444/app/id123']) {
    assert.throws(() => storeUrl(url, 'apple'), url);
  }
  for (const url of ['https://play.google.com/', 'https://play.google.com/store/apps/details', 'https://play.google.com/store/apps/details?id=invalid', 'https://play.google.com/store/apps/details?id=x%0A']) assert.throws(() => storeUrl(url, 'google'));
});
test('validates email without accepting mail headers or URL schemes', () => {
  assert.equal(supportEmail('hello@example.com'), 'hello@example.com');
  assert.throws(() => supportEmail('mailto:hello@example.com'));
  assert.throws(() => supportEmail('hello@example.com?subject=hello'));
  assert.throws(() => supportEmail('hello@example.com\nBcc:other@example.com'));
});
test('production URL is an HTTPS origin, not a path', () => {
  assert.equal(siteOrigin('https://example.com/'), 'https://example.com');
  for (const url of ['http://example.com', 'https://example.com/path', 'https://example.com/?q=x', 'https://user:pass@example.com', 'https://example.com/#test']) assert.throws(() => siteOrigin(url));
});
