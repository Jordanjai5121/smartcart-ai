import { useState } from 'react';
import { amazonSearchUrl, parseAmazonUrl } from '../lib/amazon';

export default function AmazonSearch({ onPick }: { onPick: (url: string, asin: string) => void }) {
  const [q, setQ] = useState('');
  const [link, setLink] = useState('');
  const [err, setErr] = useState('');

  return (
    <div className="card space-y-3">
      <div>
        <label className="label">1. Search on Amazon</label>
        <div className="flex gap-2">
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. boAt Airdopes 141" />
          <a className="btn" target="_blank" rel="noopener noreferrer" href={amazonSearchUrl(q || 'deals')}>Search</a>
        </div>
      </div>
      <div>
        <label className="label">2. Paste the product URL</label>
        <div className="flex gap-2">
          <input className="input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://www.amazon.in/..." />
          <button className="btn-ghost" type="button" onClick={() => {
            const r = parseAmazonUrl(link);
            if (!r) return setErr('Valid Amazon.in product link illa');
            setErr(''); onPick(r.url, r.asin);
          }}>Use</button>
        </div>
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      </div>
    </div>
  );
}