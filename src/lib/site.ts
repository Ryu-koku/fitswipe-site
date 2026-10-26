import { siteOrigin, storeUrl, supportEmail } from './config';

const origin = siteOrigin(import.meta.env.PUBLIC_SITE_URL);
const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';
if (indexable && !origin) throw new Error('Set PUBLIC_SITE_URL before enabling indexing');

export const site = {
  origin,
  indexable,
  apple: storeUrl(import.meta.env.PUBLIC_APP_STORE_URL, 'apple'),
  google: storeUrl(import.meta.env.PUBLIC_GOOGLE_PLAY_URL, 'google'),
  support: supportEmail(import.meta.env.PUBLIC_SUPPORT_EMAIL),
};
