export const AMAZON_ASSOCIATE_TAG = 'smartcartai0c-21';

export function isAmazonShortUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return /(^|\.)amzn\.in$/i.test(url.hostname) && url.pathname.length > 1;
  } catch {
    return false;
  }
}

export function amazonAffiliateUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw.trim());
    if (!/(^|\.)amazon\.in$/i.test(url.hostname) && !/(^|\.)amzn\.in$/i.test(url.hostname)) return undefined;
    url.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
    return url.toString();
  } catch {
    return undefined;
  }
}

export function amazonSearchUrl(q: string) {
  const url = new URL('https://www.amazon.in/s');
  url.searchParams.set('k', q.trim() || 'deals');
  url.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
  return url.toString();
}

export function parseAmazonUrl(raw: string): { asin: string; url: string } | null {
  try {
    const u = new URL(raw.trim());
    if (!/(^|\.)amazon\.in$|(^|\.)amzn\.in$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (!m) return null;
    const asin = m[1].toUpperCase();
    return { asin, url: \`https://www.amazon.in/dp/\${asin}\` };
  } catch {
    return null;
  }
}
