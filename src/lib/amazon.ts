export const amazonSearchUrl = (q: string) =>
  `https://www.amazon.in/s?k=${encodeURIComponent(q.trim())}`;

export function parseAmazonUrl(raw: string): { asin: string; url: string } | null {
  try {
    const u = new URL(raw.trim());
    if (!/(^|\.)amazon\.in$|(^|\.)amzn\.in$/.test(u.hostname)) return null;
    const m = u.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (!m) return null;
    const asin = m[1].toUpperCase();
    return { asin, url: `https://www.amazon.in/dp/${asin}` };
  } catch { return null; }
}