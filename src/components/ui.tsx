import {ReactNode} from 'react';
import type {DataSource} from '../types';
export const SourceBadge=({source}:{source:DataSource})=>source==='demo'
 ?<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">Demo data</span>
 :<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">Entered by you</span>;
export const DemoBanner=()=><div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
 <b>Demo mode:</b> sample products and prices are illustrative only and are <b>not live marketplace prices</b>. No marketplace is connected.</div>;
export const PageHeader=({title,sub,children}:{title:string;sub?:string;children?:ReactNode})=><div className="mb-5 flex flex-wrap items-end justify-between gap-2">
 <div><h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>{sub&&<p className="text-sm text-slate-500">{sub}</p>}</div>{children}</div>;
export const Field=({label,children}:{label:string;children:ReactNode})=><label className="block"><span className="label">{label}</span>{children}</label>;
export const Empty=({text}:{text:string})=><div className="card text-center text-sm text-slate-500">{text}</div>;
