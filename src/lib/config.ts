export function storeUrl(value: string | undefined, store: 'apple' | 'google'): string | undefined {
  const input = value?.trim();
  if (!input) return undefined;
  let url: URL;
  try { url = new URL(input); } catch { throw new Error(`Invalid ${store} store URL`); }
  const validHost = url.hostname === (store === 'apple' ? 'apps.apple.com' : 'play.google.com');
  const validListing = store === 'apple'
    ? /^\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?id\d+\/?$/.test(url.pathname)
    : url.pathname === '/store/apps/details' && /^[a-zA-Z][\w]*(?:\.[\w]+)+$/.test(url.searchParams.get('id') ?? '');
  if (url.protocol !== 'https:' || !validHost || !validListing || url.username || url.password || url.port) {
    throw new Error(`Expected an HTTPS ${store} app listing URL`);
  }
  return url.href;
}

export function supportEmail(value: string | undefined): string | undefined {
  const email = value?.trim();
  if (!email) return undefined;
  if (!/^[a-zA-Z0-9.!#$%&'*+\/=\?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(email)) {
    throw new Error('Invalid support email');
  }
  return email;
}

export function siteOrigin(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('PUBLIC_SITE_URL must be an HTTPS origin without a path');
  }
  return url.origin;
}
