import {NavLink,Outlet} from 'react-router-dom';
import {useStore} from '../store/store';
const nav=[['/','Dashboard'],['/add','Add Product'],['/compare','Price Comparison'],['/history','Price History'],['/wishlist','Wishlist'],['/cart','Cart'],['/settings','Settings']];
export default function Layout(){
 const {wishlist,cart}=useStore();const badge=(p:string)=>p==='/wishlist'?wishlist.length:p==='/cart'?cart.length:0;
 const cls=({isActive}:{isActive:boolean})=>`flex items-center justify-between whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium ${isActive?'bg-brand-50 text-brand-700':'text-slate-600 hover:bg-slate-100'}`;
 return <div className="min-h-screen md:flex">
  <aside className="border-b bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
   <div className="px-4 py-3 text-lg font-bold text-brand-700">SmartCart AI <span className="block text-xs font-normal text-slate-500">Personal Edition · India</span></div>
   <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible">
    {nav.map(([to,l])=><NavLink key={to} to={to} end={to==='/'} className={cls}>{l}{badge(to)>0&&<span className="ml-2 rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{badge(to)}</span>}</NavLink>)}
   </nav></aside>
  <main className="min-w-0 flex-1 p-4 sm:p-6"><Outlet/></main></div>;
}
