import {useStore} from '../store/store';import {Empty,PageHeader} from '../components/ui';import ProductCard from '../components/ProductCard';
export default function Wishlist(){
 const {products,wishlist}=useStore();const items=products.filter(p=>wishlist.some(w=>w.productId===p.id));
 return <><PageHeader title="Wishlist" sub={`${items.length} saved`}/>{items.length?<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map(p=><ProductCard key={p.id} p={p}/>)}</div>:<Empty text="Nothing saved yet. Tap “♡ Wishlist” on any product."/>}</>;
}
