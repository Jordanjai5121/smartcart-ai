import {FormEvent,useState} from 'react';import {useStore} from '../store/store';import {inr} from '../lib/format';import {DemoBanner,Empty,Field,PageHeader} from '../components/ui';import PriceChart from '../components/PriceChart';
export default function History(){
 const {products,history,addPricePoint}=useStore();const [id,setId]=useState(products[0]?.id??'');const [range,setRange]=useState(30);const [price,setPrice]=useState('');
 const p=products.find(x=>x.id===id);const cutoff=Date.now()-range*864e5;
 const pts=history.filter(h=>h.productId===id&&new Date(h.date).getTime()>=cutoff).sort((a,b)=>+new Date(a.date)-+new Date(b.date));
 const vals=pts.map(x=>x.price);
 function add(e:FormEvent){e.preventDefault();const n=Number(price);if(id&&n>0){addPricePoint(id,n);setPrice('')}}
 return <><PageHeader title="Price History" sub="Interactive trend chart"/><DemoBanner/>
  <div className="mb-4 flex flex-wrap gap-2"><select className="input max-w-xs" value={id} onChange={e=>setId(e.target.value)}>{products.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
   {[30,60,90].map(r=><button key={r} onClick={()=>setRange(r)} className={range===r?'btn':'btn-ghost'}>{r} days</button>)}</div>
  {p&&pts.length?<div className="card"><div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm"><span>Lowest: <b>{inr(Math.min(...vals))}</b></span><span>Highest: <b>{inr(Math.max(...vals))}</b></span><span>Latest: <b>{inr(vals[vals.length-1])}</b></span>
   <span className="text-amber-700">{p.source==='demo'?'Demo history — simulated, not real prices':'Only prices you logged manually'}</span></div><PriceChart points={pts} target={p.targetPrice}/></div>:<Empty text="No price points in this range."/>}
  <form onSubmit={add} className="card mt-4 grid max-w-md gap-3 sm:grid-cols-2"><Field label="Log today's price (₹)"><input className="input" inputMode="numeric" value={price} onChange={e=>setPrice(e.target.value)}/></Field><div className="flex items-end"><button className="btn w-full">Add price point</button></div></form></>;
}
