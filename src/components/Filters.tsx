import {useMemo,useState} from 'react';import type {Product} from '../types';import {useStore} from '../store/store';import {CATEGORIES} from '../data/demo';
export function useFilters(){
 const {products,offers}=useStore();const [q,setQ]=useState('');const [cat,setCat]=useState('All');const [sort,setSort]=useState('new');const [below,setBelow]=useState(false);
 const list=useMemo(()=>{
  const pr=(p:Product)=>offers.filter(o=>o.productId===p.id).reduce((m,o)=>Math.min(m,o.price),Infinity);
  let l:Product[]=products.filter(p=>(cat==='All'||p.category===cat)&&(p.name+p.brand).toLowerCase().includes(q.toLowerCase()));
  if(below)l=l.filter(p=>p.targetPrice!==undefined&&pr(p)<=p.targetPrice);
  if(sort==='low')l=[...l].sort((a,b)=>pr(a)-pr(b));if(sort==='high')l=[...l].sort((a,b)=>pr(b)-pr(a));return l},[products,offers,q,cat,sort,below]);
 const ui=<div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
  <input className="input" placeholder="Search products…" value={q} onChange={e=>setQ(e.target.value)}/>
  <select className="input" value={cat} onChange={e=>setCat(e.target.value)}><option>All</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
  <select className="input" value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={below} onChange={e=>setBelow(e.target.checked)}/>At/below target only</label></div>;
 return {list,ui};
}
