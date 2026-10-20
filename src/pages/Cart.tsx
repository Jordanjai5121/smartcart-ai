import {useStore} from '../store/store';import {inr} from '../lib/format';import {Empty,PageHeader} from '../components/ui';
export default function Cart(){
 const {cart,products,setQty,removeFromCart}=useStore();const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
 return <><PageHeader title="Shopping Cart" sub="A planning list — checkout happens on the store's own site"/>
  {cart.length?<div className="space-y-3">{cart.map(i=>{const p=products.find(x=>x.id===i.productId);return <div key={i.productId+i.store} className="card flex flex-wrap items-center justify-between gap-3">
   <div><div className="font-semibold">{p?.name}</div><div className="text-xs text-slate-500">{i.store} · {inr(i.price)} each</div></div>
   <div className="flex items-center gap-2"><button className="btn-ghost" onClick={()=>setQty(i.productId,i.qty-1)}>−</button><span className="w-6 text-center">{i.qty}</span><button className="btn-ghost" onClick={()=>setQty(i.productId,i.qty+1)}>+</button>
    <span className="w-24 text-right font-semibold">{inr(i.price*i.qty)}</span><button className="btn-ghost" onClick={()=>removeFromCart(i.productId)}>Remove</button></div></div>})}
   <div className="card flex justify-between text-lg font-bold"><span>Total</span><span>{inr(total)}</span></div></div>:<Empty text="Your cart is empty."/>}</>;
}
