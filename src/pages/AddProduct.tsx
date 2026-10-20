import {FormEvent,useState} from 'react';import {useNavigate} from 'react-router-dom';import {useStore} from '../store/store';import {Field,PageHeader} from '../components/ui';import {CATEGORIES,STORES} from '../data/demo';
export default function AddProduct(){
 const {addProduct}=useStore();const nav=useNavigate();const [err,setErr]=useState('');
 const [f,setF]=useState({name:'',brand:'',category:CATEGORIES[0],store:STORES[0],price:'',target:'',url:''});
 const set=(k:keyof typeof f)=>(e:{target:{value:string}})=>setF({...f,[k]:e.target.value});
 function submit(e:FormEvent){e.preventDefault();const price=Number(f.price),target=f.target?Number(f.target):undefined;
  if(!f.name.trim())return setErr('Product name is required.');if(!(price>0))return setErr('Enter a valid price in ₹.');
  if(target!==undefined&&!(target>0))return setErr('Target price must be a positive number.');
  if(f.url&&!/^https?:\/\//.test(f.url))return setErr('Product link must start with http:// or https://');
  addProduct({name:f.name.trim(),brand:f.brand.trim(),category:f.category,store:f.store,price,targetPrice:target,url:f.url||undefined});nav('/');}
 return <><PageHeader title="Add Product" sub="Prices you enter are saved as “entered by you” — nothing is fetched from any marketplace"/>
  <form onSubmit={submit} className="card grid max-w-2xl gap-3 sm:grid-cols-2">
   <div className="sm:col-span-2"><Field label="Product name *"><input className="input" value={f.name} onChange={set('name')}/></Field></div>
   <Field label="Brand"><input className="input" value={f.brand} onChange={set('brand')}/></Field>
   <Field label="Category"><select className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
   <Field label="Store"><select className="input" value={f.store} onChange={set('store')}>{STORES.map(c=><option key={c}>{c}</option>)}</select></Field>
   <Field label="Current price (₹) *"><input className="input" inputMode="numeric" value={f.price} onChange={set('price')}/></Field>
   <Field label="Target price (₹)"><input className="input" inputMode="numeric" value={f.target} onChange={set('target')}/></Field>
   <Field label="Product link (optional)"><input className="input" value={f.url} onChange={set('url')}/></Field>
   {err&&<p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
   <div className="sm:col-span-2"><button className="btn">Save product</button></div></form></>;
}
