import {FormEvent,useState} from 'react';import {useStore} from '../store/store';import {Field,PageHeader} from '../components/ui';
export default function SettingsPage(){
 const {settings,updateSettings,resetDemo}=useStore();const [s,setS]=useState(settings);const [ok,setOk]=useState(false);
 function save(e:FormEvent){e.preventDefault();updateSettings(s);setOk(true);setTimeout(()=>setOk(false),2000)}
 return <><PageHeader title="Settings"/><form onSubmit={save} className="card grid max-w-xl gap-3">
  <Field label="Display name"><input className="input" value={s.displayName} onChange={e=>setS({...s,displayName:e.target.value})}/></Field>
  <Field label="Currency"><input className="input bg-slate-100" value="INR (₹) — fixed for this edition" disabled/></Field>
  <Field label="Price-drop alert threshold (%)"><input type="number" min={1} max={90} className="input" value={s.alertThresholdPct} onChange={e=>setS({...s,alertThresholdPct:Number(e.target.value)})}/></Field>
  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.emailAlerts} onChange={e=>setS({...s,emailAlerts:e.target.checked})}/>Email alerts (needs backend — not active yet)</label>
  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.weeklyDigest} onChange={e=>setS({...s,weeklyDigest:e.target.checked})}/>Weekly digest (needs backend — not active yet)</label>
  <div className="flex items-center gap-3"><button className="btn">Save settings</button>{ok&&<span className="text-sm text-emerald-700">Saved — refresh to verify</span>}</div></form>
  <div className="card mt-4 max-w-xl"><div className="mb-2 text-sm text-slate-600">Supabase: <b>connected</b>. Manual products are saved to your account.</div><button className="btn-ghost" onClick={resetDemo}>Reset demo data</button></div></>;
}
