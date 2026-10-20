import {FormEvent,useState} from 'react';import {useStore} from '../store/store';import {inr} from '../lib/format';import {DemoBanner,Empty,Field,PageHeader,SourceBadge} from '../components/ui';import {STORES} from '../data/demo';
export default function Compare(){
 const {products,offers,addToCart,addOffer}=useStore();const [id,setId]=useState(products[0]?.id??'');const [store,setStore]=useState(STORES[0]);const [price,setPrice]=useState('');
 const rows=offers.filter(o=>o.productId===id).sort((a,b)=>a.price-b.price);const max=rows.length?rows[rows.length-1].price:0;
 function add(e:FormEvent){e.preventDefault();const n=Number(price);if(!id||!(n>0))return;addOffer(id,store,n);setPrice('')}
 return <><PageHeader title="Price Comparison" sub="Compare store prices for one product"/><DemoBanner/>
  <select className="input mb-4 max-w-md" value={id} onChange={e=>setId(e.target.value)}>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
  {rows.length?<div className="card overflow-x-auto p-0"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><th className="p-3">Store</th><th>Price</th><th>Vs highest</th><th>Source</th><th></th></tr></thead>
   <tbody>{rows.map((o,i)=><tr key={o.id} className="border-t"><td className="p-3 font-medium">{o.store}{i===0&&<span className="ml-2 text-xs text-emerald-700">Lowest</span>}</td><td className="font-semibold">{inr(o.price)}</td><td className="text-slate-500">{max>o.price?`Save ${inr(max-o.price)}`:'—'}</td><td><SourceBadge source={o.source}/></td>
    <td className="pr-3 text-right"><button className="btn-ghost" onClick={()=>addToCart(id,o.store,o.price)}>Add to cart</button></td></tr>)}</tbody></table></div>:<Empty text="No prices for this product yet."/>}
  <form onSubmit={add} className="card mt-4 grid max-w-2xl gap-3 sm:grid-cols-3"><Field label="Store"><select className="input" value={store} onChange={e=>setStore(e.target.value)}>{STORES.map(s=><option key={s}>{s}</option>)}</select></Field>
   <Field label="Price you saw (₹)"><input className="input" inputMode="numeric" value={price} onChange={e=>setPrice(e.target.value)}/></Field><div className="flex items-end"><button className="btn w-full">Add price manually</button></div></form></>;
}
