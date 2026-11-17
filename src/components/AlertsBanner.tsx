import { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { inr } from '../lib/format';
import { amazonAffiliateUrl } from '../lib/amazon';
import { notifyOnce } from '../lib/notify';

interface Alert {
  key: string;
  name: string;
  price: number;
  hitTarget: boolean;
  dropPct: number;
  buy?: string;
}

export default function AlertsBanner() {
  const { products, offers, history, settings, bestOffer } = useStore();
  const [hidden, setHidden] = useState<string[]>([]);

  const alerts: Alert[] = [];

  for (const p of products) {
    if (p.source !== 'manual') continue;
    const o = bestOffer(p.id);
    if (!o) continue;

    const pts = history
      .filter(h => h.productId === p.id)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));

    const hitTarget = p.targetPrice !== undefined && o.price <= p.targetPrice;

    let dropPct = 0;
    if (pts.length >= 2 && pts[1].price > pts[0].price) {
      dropPct = ((pts[1].price - pts[0].price) / pts[1].price) * 100;
    }
    const bigDrop = dropPct >= settings.alertThresholdPct;

    if (!hitTarget && !bigDrop) continue;

    const amazon = offers.find(x => x.productId === p.id && x.store === 'Amazon.in' && x.url);

    alerts.push({
      key: `${p.id}:${o.price}`,
      name: p.name,
      price: o.price,
      hitTarget,
      dropPct,
      buy: amazonAffiliateUrl(amazon?.url),
    });
  }

  const keys = alerts.map(a => a.key).join('|');

  useEffect(() => {
    (async () => {
      for (const a of alerts) {
        const why = a.hitTarget ? 'reached your target' : `dropped ${a.dropPct.toFixed(0)}%`;
        await notifyOnce(a.key, '🔔 SmartCart price alert', `${a.name} is now ${inr(a.price)} · ${why}`);
      }
    })();
  }, [keys]);

  const visible = alerts.filter(a => !hidden.includes(a.key));
  if (visible.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {visible.map(a => (
        <div key={a.key} className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          <div className="flex-1">
            <div className="font-semibold">🔔 Price alert: {a.name}</div>
            <div>
              Now {inr(a.price)}
              {a.hitTarget && ' · reached your target'}
              {a.dropPct > 0 && ` · dropped ${a.dropPct.toFixed(0)}%`}
            </div>
          </div>
          {a.buy && (
            <a className="btn" href={a.buy} target="_blank" rel="sponsored nofollow noopener noreferrer">
              Buy on Amazon ↗
            </a>
          )}
          <button className="btn-ghost" onClick={() => setHidden([...hidden, a.key])}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}
