import type {Product} from '../types';import {useStore} from '../store/store';import {inr} from '../lib/format';import {SourceBadge} from './ui';
export default function ProductCard({p}:{p:Product}){
 const {bestOffer,wishlist,toggleWishlist,addToCart}=useStore();const o=bestOffer(p.id);const liked=wishlist.some(w=>w.productId===p.id);
 const hit=o&&p.targetPrice!==undefined&&o.price<=p.targetPrice;
 return <div className="card flex flex-col gap-2">
  <div className="flex items-start justify-between gap-2"><div><div className="text-xs text-slate-500">{p.brand} · {p.category}</div><div className="font-semibold text-slate-900">{p.name}</div></div><SourceBadge source={p.source}/></div>
  <div><span className="text-xl font-bold">{o?inr(o.price):'—'}</span>{o&&<span className="ml-2 text-xs text-slate-500">lowest on {o.store}</span>}</div>
  <div className="text-xs text-slate-500">Target: {p.targetPrice!==undefined?inr(p.targetPrice):'not set'} {hit&&<span className="ml-1 font-semibold text-emerald-700">· at/below target</span>}</div>
  <div className="mt-auto flex gap-2 pt-1">
   <button className="btn-ghost flex-1" onClick={()=>toggleWishlist(p.id)}>{liked?'♥ Saved':'♡ Wishlist'}</button>
   <button className="btn flex-1" disabled={!o} onClick={()=>o&&addToCart(p.id,o.store,o.price)}>Add to cart</button></div></div>;
}
