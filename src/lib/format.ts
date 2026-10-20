const f=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});
export const inr=(n:number)=>f.format(n);
export const shortDate=(iso:string)=>new Date(iso).toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
