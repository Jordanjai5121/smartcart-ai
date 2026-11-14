import { useState } from 'react';
import type { Product } from '../types';
import { useStore } from '../store/store';
import { inr } from '../lib/format';
import { SourceBadge } from './ui';
import { parseAmazonUrl } from '../lib/amazon';
import { CATEGORIES, STORES } from '../data/demo';

const ASSOCIATE_TAG = 'smartcartai0c-21';
const DAY = 24 * 60 * 60 * 1000;

function getAmazonAffiliateUrl(url?: string) {
  if (!url) return undefined;
  const parsed = parseAmazonUrl(url);
  if (!parsed) return undefined;
  return `${parsed.url}?tag=${ASSOCIATE_TAG}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ProductCard({ p }: { p: Product }) {
  const {
    bestOffer, offers, history, wishlist, toggleWishlist, addToCart,
    updateProduct, deleteProduct, updatePrice,
  } = useStore();
  const o = bestOffer(p.id);
  const mine = offers.find(x => x.productId === p.id);
  const liked = wishlist.some(w => w.productId === p.id);
  const amazonOffer = offers
    .filter(offer => offer.productId === p.id && offer.store === 'Amazon.in' && Boolean(offer.url))
    .sort((a, b) => a.price - b.price)[0];
  const affiliateUrl = getAmazonAffiliateUrl(amazonOffer?.url);
  const hit = o && p.targetPrice !== undefined && o.price <= p.targetPrice;
  const canEdit = p.source === 'manual';

  const last = history
    .filter(h => h.productId === p.id)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
  const stale = last ? Date.now() - +new Date(last.date) > 2 * DAY : false;

  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', brand: '', category: '', store: '', price: '', target: '', url: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const [quick, setQuick] = useState(false);
  const [qp, setQp] = useState('');
  const [qerr, setQerr] = useState('');

  function startEdit() {
    setF({
      name: p.name,
      brand: p.brand,
      category: p.category,
      store: mine?.store ?? STORES[0],
      price: mine ? String(mine.price) : '',
      target: p.targetPrice !== undefined ? String(p.targetPrice) : '',
      url: mine?.url ?? '',
    });
    setErr('');
    setEditing(true);
  }

  function save() {
    const price = Number(f.price);
    const target = f.target ? Number(f.target) : undefined;
    if (!f.name.trim()) return setErr('Product name is required.');
    if (!(price > 0)) return setErr('Enter a valid price.');
    if (target !== undefined && !(target > 0)) return setErr('Target price must be a positive number.');
    if (f.url && !/^https?:\/\//.test(f.url)) return setErr('Link must start with http:// or https://');
    if (f.url && f.store === 'Amazon.in' && !parseAmazonUrl(f.url)) return setErr('Paste the full amazon.in link that has /dp/CODE in it. Short amzn.in links will not work.');
    updateProduct(p.id, {
      name: f.name.trim(),
      brand: f.brand.trim(),
      category: f.category,
      store: f.store,
      price,
      targetPrice: target,
      url: f.url.trim() || undefined,
    });
    setEditing(false);
  }

  function saveQuick() {
    const price = Number(qp);
    if (!(price > 0)) return setQerr('Enter a valid price.');
    updatePrice(p.id, price);
    setQerr('');
    setQuick(false);
  }

  function remove() {
    if (window.confirm(`Delete "${p.name}"?`)) deleteProduct(p.id);
  }

  if (editing) {
    return (
      <div className="card flex flex-col gap-2">
        <label className="label">Product name</label>
        <input className="input" value={f.name} onChange={set('name')} />
        <label className="label">Brand</label>
        <input className="input" value={f.brand} onChange={set('brand')} />
        <label className="label">Category</label>
        <select className="input" value={f.category} onChange={set('category')}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <label className="label">Store</label>
        <select className="input" value={f.store} onChange={set('store')}>
          {STORES.map(c => <option key={c}>{c}</option>)}
        </select>
        <label className="label">Current price (₹)</label>
        <input className="input" inputMode="numeric" value={f.price} onChange={set('price')} />
        <label className="label">Target price (₹)</label>
        <input className="input" inputMode="numeric" value={f.target} onChange={set('target')} />
        <label className="label">Amazon.in product link</label>
        <input className="input" value={f.url} onChange={set('url')} placeholder="https://www.amazon.in/dp/..." />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-2 pt-1">
          <button className="btn flex-1" onClick={save}>Save</button>
          <button className="btn-ghost flex-1" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

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
      {canEdit && last && (
        <div className={`text-xs ${stale ? 'text-amber-700' : 'text-slate-500'}`}>
          Price updated: {fmtDate(last.date)}{stale && ' · may be old, check Amazon'}
        </div>
      )}
      {affiliateUrl && (
        <a className="btn w-full text-center" href={affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer">
          Buy on Amazon ↗
        </a>
      )}
      {offers.some(offer => offer.productId === p.id && offer.store === 'Amazon.in') && !affiliateUrl && (
        <p className="text-xs text-slate-500">Add a valid Amazon.in product URL to enable the affiliate button.</p>
      )}
      {canEdit && (quick ? (
        <div className="flex flex-col gap-2">
          <input className="input" inputMode="numeric" placeholder="New price (₹)" value={qp} onChange={e => setQp(e.target.value)} />
          {qerr && <p className="text-sm text-red-600">{qerr}</p>}
          <div className="flex gap-2">
            <button className="btn flex-1" onClick={saveQuick}>Save price</button>
            <button className="btn-ghost flex-1" onClick={() => { setQuick(false); setQerr(''); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn-ghost w-full" onClick={() => { setQp(o ? String(o.price) : ''); setQuick(true); }}>
          Update price
        </button>
      ))}
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <button className="btn-ghost flex-1" onClick={() => toggleWishlist(p.id)}>
          {liked ? '♥ Saved' : '♡ Wishlist'}
        </button>
        <button className="btn flex-1" disabled={!o} onClick={() => o && addToCart(p.id, o.store, o.price)}>
          Add to cart
        </button>
      </div>
      {canEdit && (
        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={startEdit}>Edit</button>
          <button className="btn-ghost flex-1 text-red-600" onClick={remove}>Delete</button>
        </div>
      )}
    </div>
  );
}