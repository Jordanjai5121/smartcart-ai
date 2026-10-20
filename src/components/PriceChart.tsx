import {LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,ReferenceLine,CartesianGrid} from 'recharts';
import type {PricePoint} from '../types';import {inr,shortDate} from '../lib/format';
export default function PriceChart({points,target}:{points:PricePoint[];target?:number}){
 const data=points.map(p=>({date:shortDate(p.date),price:p.price}));
 return <div className="h-72 w-full"><ResponsiveContainer><LineChart data={data} margin={{top:8,right:12,left:0,bottom:0}}>
  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="date" tick={{fontSize:11}} minTickGap={24}/>
  <YAxis tick={{fontSize:11}} width={72} domain={['auto','auto']} tickFormatter={(v:number)=>inr(v)}/>
  <Tooltip formatter={(v:number)=>inr(v)}/>{target!==undefined&&<ReferenceLine y={target} stroke="#059669" strokeDasharray="4 4" label={{value:'Target',fontSize:11,fill:'#059669'}}/>}
  <Line type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={2} dot={data.length<4}/></LineChart></ResponsiveContainer></div>;
}
