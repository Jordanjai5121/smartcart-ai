import type { Product } from '../types';
import { useStore } from '../store/store';
import { inr } from '../lib/format';
import { SourceBadge } from './ui';

const ASSOCIATE_TAG = 'smartcartai0c-21';

function getAmazonAffiliateUrl(url?: string) {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host !== 'amazon.in' && host !== 'www.amazon.in') return undefined;

    parsed.searchParams.set('tag', ASSOCIATE_TAG);
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export default function ProductCard({ p }: { p: Product }) {
  const { bestOffer, wishlist, toggleWishlist, addToCart } = useStore();
  const o = bestOffer(p.id);
  const liked = wishlist.some(w => w.productId === p.id);
  const affiliateUrl = o?.store === 'Amazon.in' ? getAmazonAffiliateUrl(o.url) : undefined;
  const hit = o && p.targetPrice !== undefined && o.price <= p.targetPrice;

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500">{p.brand} · {p.category}</div>
          <div className="font-semibold text-slate-900">{p.name}</div>
        </div>
        <SourceBadge source={p.source} />
      </div>
      <div>
        <span className="text-xl font-bold">{o ? inr(o.price) : '—'}</span>
        {o && <span className="ml-2 text-xs text-slate-500">lowest on {o.store}</span>}
      </div>
      <div className="text-xs text-slate-500">
        Target: {p.targetPrice !== undefined ? inr(p.targetPrice) : 'not set'}
        {hit && <span className="ml-1 font-semibold text-emerald-700">· at/below target</span>}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <button className="btn-ghost flex-1" onClick={() => toggleWishlist(p.id)}>
          {liked ? '♥ Saved' : '♡ Wishlist'}
        </button>
        <button className="btn flex-1" disabled={!o} onClick={() => o && addToCart(p.id, o.store, o.price)}>
          Add to cart
        </button>
        {affiliateUrl && (
          <a
            className="btn w-full text-center"
            href={affiliateUrl}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
          >
            Buy on Amazon ↗
          </a>
        )}
      </div>
      {o?.store === 'Amazon.in' && !affiliateUrl && (
        <p className="text-xs text-slate-500">Add a valid Amazon.in product URL to enable the affiliate button.</p>
      )}
    </div>
  );
}
