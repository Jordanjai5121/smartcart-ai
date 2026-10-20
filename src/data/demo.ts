import type {Product,Offer,PricePoint} from '../types';
// ALL VALUES BELOW ARE SAMPLE DEMO DATA, NOT REAL OR LIVE MARKETPLACE PRICES.
export const STORES=['Amazon.in','Flipkart','Croma','Reliance Digital','Other'];
export const CATEGORIES=['Mobiles','Laptops','Audio','Appliances','Wearables','Other'];
const raw:[string,string,string,number,number][]=[
['Sample Phone X 128GB','DemoBrand','Mobiles',24999,23000],['Sample Laptop Pro 14','DemoBrand','Laptops',64990,60000],
['Sample ANC Headphones','AudioDemo','Audio',5999,4999],['Sample Air Fryer 4L','HomeDemo','Appliances',6499,5500],
['Sample Smartwatch S2','WearDemo','Wearables',3999,3499],['Sample Soundbar 2.1','AudioDemo','Audio',8999,7999]];
const today=new Date();
const rnd=(s:number)=>{const x=Math.sin(s*9301+49297)*233280;return x-Math.floor(x)};
export function demoData(){
 const products:Product[]=[],offers:Offer[]=[],history:PricePoint[]=[];
 raw.forEach(([name,brand,category,base,target],i)=>{
  const id=`demo-${i+1}`;products.push({id,name,brand,category,targetPrice:target,source:'demo',createdAt:today.toISOString()});
  STORES.slice(0,4).forEach((store,j)=>offers.push({id:`${id}-o${j}`,productId:id,store,source:'demo',price:Math.round(base*(1+(rnd(i*7+j)-0.4)*0.08)/10)*10}));
  for(let d=89;d>=0;d--){const dt=new Date(today);dt.setDate(dt.getDate()-d);
   const price=Math.round(base*(1+Math.sin((d+i*5)/9)*0.05+(rnd(i*100+d)-0.5)*0.04)/10)*10;
   history.push({id:`${id}-h${d}`,productId:id,date:dt.toISOString(),price,source:'demo'});}
 });
 return {products,offers,history};
}
