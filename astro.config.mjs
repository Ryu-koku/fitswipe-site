import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  // Keep the enhancement external so Cloudflare's self-only script CSP works.
  vite: { build: { assetsInlineLimit: 0 } },
});
