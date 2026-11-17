import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { Field, PageHeader } from '../components/ui';
import { CATEGORIES, STORES } from '../data/demo';
import { isAmazonShortUrl, parseAmazonUrl } from '../lib/amazon';

type ProductForm = {
  name: string;
  brand: string;
  category: string;
  store: string;
  price: string;
  target: string;
  url: string;
};

const emptyForm: ProductForm = {
  name: '',
  brand: '',
  category: CATEGORIES[0],
  store: 'Amazon.in',
  price: '',
  target: '',
  url: '',
};

function findAmazonUrl(value: string): string {
  const match = value.match(/https?:\\/\\/[^\\s<>"]+/i);
  return (match?.[0] ?? value).replace(/[),.;]+$/, '').trim();
}

function productNameFromShare(title: string, text: string, asin?: string): string {
  const cleanTitle = title.trim();
  if (cleanTitle && !/^https?:\\/\\//i.test(cleanTitle)) return cleanTitle;
  const withoutUrl = text.replace(/https?:\\/\\/[^\\s<>"]+/gi, '').trim();
  if (withoutUrl && !/^(check this out|look what i found|amazon)$/i.test(withoutUrl)) {
    return withoutUrl.slice(0, 120);
  }
  return asin ? `Amazon product ${asin}` : '';
}

export default function AddProduct() {
  const { addProduct } = useStore();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');
  const [f, setF] = useState<ProductForm>(emptyForm);

  // Android Chrome installed-PWA Share Target arrives here with title/text/url.
  useEffect(() => {
    const sharedUrl = searchParams.get('url') || findAmazonUrl(searchParams.get('text') || '');
    if (!sharedUrl) return;

    const parsed = parseAmazonUrl(sharedUrl);
    const isShort = isAmazonShortUrl(sharedUrl);
    const title = productNameFromShare(
      searchParams.get('title') || '',
      searchParams.get('text') || '',
      parsed?.asin,
    );

    setF(old => ({
      ...old,
      name: title || old.name || (isShort ? 'Amazon item' : ''),
      store: 'Amazon.in',
      url: parsed?.url || sharedUrl,
    }));
    setNotice(parsed
      ? 'Amazon product received. Check the details and enter the price.'
      : isShort
        ? 'Amazon short link received. Add the product name and price, then save.'
        : 'Shared link received. Please check that it is an Amazon product link.');
    setErr('');
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const set = (k: keyof ProductForm) => (e: { target: { value: string } }) =>
    setF(old => ({ ...old, [k]: e.target.value }));

  async function pasteAmazonLink() {
    setErr('');
    setNotice('');
    try {
      if (!navigator.clipboard?.readText) {
        throw new Error('Clipboard access is not available in this browser.');
      }
      const clip = await navigator.clipboard.readText();
      const link = findAmazonUrl(clip);
      const parsed = parseAmazonUrl(link);
      if (parsed) {
        setF(old => ({ ...old, store: 'Amazon.in', url: parsed.url, name: old.name || `Amazon product ${parsed.asin}` }));
        setNotice('Amazon product link pasted. Enter the price, then save.');
        return;
      }
      if (isAmazonShortUrl(link)) {
        setF(old => ({ ...old, store: 'Amazon.in', url: link, name: old.name || 'Amazon item' }));
        setNotice('Amazon short link pasted successfully. Add or edit the product name and enter the price, then save.');
        return;
      }
      setErr('This does not look like a supported Amazon.in product link. Copy the product link again and try.');
    } catch {
      setErr('Clipboard permission was blocked. Paste the link into the Product link field instead.');
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const price = Number(f.price);
    const target = f.target ? Number(f.target) : undefined;
    if (!f.name.trim()) return setErr('Product name is required.');
    if (!(price > 0)) return setErr('Enter a valid price in ₹.');
    if (target !== undefined && !(target > 0)) return setErr('Target price must be a positive number.');
    if (f.url && !/^https?:\\/\\//.test(f.url)) return setErr('Product link must start with http:// or https://');
    if (f.store === 'Amazon.in' && f.url && !parseAmazonUrl(f.url) && !isAmazonShortUrl(f.url)) {
      return setErr('Please enter a valid Amazon.in product link or amzn.in short link.');
    }
    addProduct({
      name: f.name.trim(),
      brand: f.brand.trim(),
      category: f.category,
      store: f.store,
      price,
      targetPrice: target,
      url: f.url.trim() || undefined,
    });
    nav('/');
  }

  return (
    <>
      <PageHeader title="Add Product" sub="Add an Amazon item by sharing it to SmartCart, or paste its link. Prices are entered by you." />
      <form onSubmit={submit} className="card grid max-w-2xl gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
          <p className="font-semibold text-slate-900">Quick add from Amazon</p>
          <p className="mt-1 text-sm text-slate-600">Android: Amazon → Share → SmartCart AI. iPhone: Amazon → Share → Copy, then return here and tap Paste Amazon link.</p>
          <button type="button" className="btn mt-3 w-full" onClick={pasteAmazonLink}>Paste Amazon link from clipboard</button>
        </div>
        {notice && <p className="text-sm text-emerald-700 sm:col-span-2">{notice}</p>}
        <div className="sm:col-span-2"><Field label="Product name *"><input className="input" value={f.name} onChange={set('name')} placeholder="Product name" /></Field></div>
        <Field label="Brand"><input className="input" value={f.brand} onChange={set('brand')} /></Field>
        <Field label="Category"><select className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Store"><select className="input" value={f.store} onChange={set('store')}>{STORES.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Current price (₹) *"><input className="input" inputMode="decimal" value={f.price} onChange={set('price')} placeholder="Enter current price" /></Field>
        <Field label="Target price (₹)"><input className="input" inputMode="decimal" value={f.target} onChange={set('target')} /></Field>
        <div className="sm:col-span-2">
          <Field label="Amazon.in product link"><input className="input" value={f.url} onChange={set('url')} placeholder="https://www.amazon.in/.../dp/ASIN or https://amzn.in/d/..." /></Field>
          <p className="mt-1 text-xs text-slate-500">Amazon product links and amzn.in short links are supported. Product prices are entered manually.</p>
        </div>
        {err && <p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
        <div className="sm:col-span-2"><button className="btn w-full">Save product</button></div>
      </form>
    </>
  );
}
