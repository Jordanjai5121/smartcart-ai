import {useStore} from '../store/store';import {inr} from '../lib/format';import {DemoBanner,PageHeader,Empty} from '../components/ui';import ProductCard from '../components/ProductCard';import {useFilters} from '../components/Filters';
export default function Dashboard(){
 const {products,wishlist,cart,bestOffer}=useStore();const {list,ui}=useFilters();
 const hits=products.filter(p=>{const o=bestOffer(p.id);return o&&p.targetPrice!==undefined&&o.price<=p.targetPrice}).length;
 const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
 const stats=[['Tracked products',String(products.length)],['At/below target',String(hits)],['Wishlist',String(wishlist.length)],['Cart total',inr(total)]];
 return <><PageHeader title="Dashboard" sub="Your private price-tracking overview"/><DemoBanner/>
  <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([l,v])=><div key={l} className="card"><div className="text-xs text-slate-500">{l}</div><div className="text-xl font-bold">{v}</div></div>)}</div>
  {ui}{list.length?<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{list.map(p=><ProductCard key={p.id} p={p}/>)}</div>:<Empty text="No products match your filters."/>}</>;
}
