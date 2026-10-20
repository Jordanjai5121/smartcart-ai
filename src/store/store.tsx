
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type {
  Product,
  Offer,
  PricePoint,
  WishlistItem,
  CartItem,
  Settings,
} from '../types';

import { demoData } from '../data/demo';
import { supabase } from '../lib/supabase';

const uid = () => crypto.randomUUID();

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const dataSource = (value: string): 'demo' | 'manual' =>
  value === 'demo' ? 'demo' : 'manual';

export interface NewProduct {
  name: string;
  brand: string;
  category: string;
  store: string;
  price: number;
  url?: string;
  targetPrice?: number;
}

interface Ctx {
  products: Product[];
  offers: Offer[];
  history: PricePoint[];
  wishlist: WishlistItem[];
  cart: CartItem[];
  settings: Settings;
  addProduct(p: NewProduct): string;
  addOffer(productId: string, store: string, price: number): void;
  addPricePoint(productId: string, price: number): void;
  toggleWishlist(id: string): void;
  addToCart(id: string, store: string, price: number): void;
  setQty(id: string, q: number): void;
  removeFromCart(id: string): void;
  updateSettings(s: Settings): void;
  resetDemo(): void;
  bestOffer(id: string): Offer | undefined;
}

const C = createContext<Ctx>(null!);
export const useStore = () => useContext(C);

const defSettings: Settings = {
  displayName: '',
  alertThresholdPct: 10,
  emailAlerts: false,
  weeklyDigest: false,
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = demoData();

  const [products, setProducts] = useState<Product[]>(initial.products);
  const [offers, setOffers] = useState<Offer[]>(initial.offers);
  const [history, setHistory] = useState<PricePoint[]>(initial.history);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<Settings>(defSettings);

  useEffect(() => {
    let active = true;

    async function loadUserData(userId: string | null) {
      if (!active) return;

      if (!userId) {
        const demo = demoData();
        setProducts(demo.products);
        setOffers(demo.offers);
        setHistory(demo.history);
        setWishlist([]);
        setCart([]);
        setSettings(defSettings);
        return;
      }

      const [pRes, oRes, hRes, wRes, cRes, sRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('offers').select('*').order('created_at', { ascending: false }),
        supabase.from('price_points').select('*').order('recorded_at', { ascending: false }),
        supabase.from('wishlist').select('*'),
        supabase.from('cart_items').select('*'),
        supabase.from('settings').select('*').maybeSingle(),
      ]);

      if (!active) return;

      const error = pRes.error || oRes.error || hRes.error ||
        wRes.error || cRes.error || sRes.error;

      if (error) {
        console.error('SmartCart database load failed:', error.message);
        return;
      }

      const dbProducts: Product[] = (pRes.data ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        brand: r.brand ?? '',
        category: r.category ?? 'Other',
        targetPrice: r.target_price == null ? undefined : Number(r.target_price),
        source: dataSource(r.source),
        createdAt: r.created_at,
      }));

      const dbOffers: Offer[] = (oRes.data ?? []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        store: r.store,
        price: Number(r.price),
        url: r.url ?? undefined,
        source: dataSource(r.source),
      }));

      const dbHistory: PricePoint[] = (hRes.data ?? []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        date: r.recorded_at,
        price: Number(r.price),
        source: dataSource(r.source),
      }));

      const dbWishlist: WishlistItem[] = (wRes.data ?? []).map((r: any) => ({
        productId: r.product_id,
        addedAt: r.added_at,
      }));

      const dbCart: CartItem[] = (cRes.data ?? []).map((r: any) => ({
        productId: r.product_id,
        store: r.store,
        price: Number(r.price),
        qty: Number(r.qty ?? 1),
      }));

      const savedSettings = sRes.data;

      setProducts([...dbProducts, ...demoData().products]);
      setOffers([...dbOffers, ...demoData().offers]);
      setHistory([...dbHistory, ...demoData().history]);
      setWishlist(dbWishlist);
      setCart(dbCart);
      setSettings(savedSettings ? {
        displayName: savedSettings.display_name ?? '',
        alertThresholdPct: savedSettings.alert_threshold_pct ?? 10,
        emailAlerts: savedSettings.email_alerts ?? false,
        weeklyDigest: savedSettings.weekly_digest ?? false,
      } : defSettings);
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Could not read session:', error.message);
      void loadUserData(data.session?.user.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void loadUserData(session?.user.id ?? null);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const bestOffer = (id: string) =>
    offers.filter(o => o.productId === id).sort((a, b) => a.price - b.price)[0];

  const addProduct = (p: NewProduct): string => {
    const id = uid();
    const now = new Date().toISOString();

    const product: Product = {
      id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      targetPrice: p.targetPrice,
      source: 'manual',
      createdAt: now,
    };

    const offer: Offer = {
      id: uid(),
      productId: id,
      store: p.store,
      price: p.price,
      url: p.url,
      source: 'manual',
    };

    const point: PricePoint = {
      id: uid(),
      productId: id,
      date: now,
      price: p.price,
      source: 'manual',
    };

    setProducts(old => [product, ...old]);
    setOffers(old => [offer, ...old]);
    setHistory(old => [point, ...old]);

    void (async () => {
      const { error: productError } = await supabase.from('products').insert({
        id,
        name: p.name,
        brand: p.brand || null,
        category: p.category,
        target_price: p.targetPrice ?? null,
        source: 'manual',
      });

      if (productError) {
        console.error('Product save failed:', productError.message);
        return;
      }

      const { error: offerError } = await supabase.from('offers').insert({
        id: offer.id,
        product_id: id,
        store: p.store,
        price: p.price,
        url: p.url ?? null,
        source: 'manual',
      });

      if (offerError) console.error('Offer save failed:', offerError.message);

      const { error: historyError } = await supabase.from('price_points').insert({
        id: point.id,
        product_id: id,
        price: p.price,
        source: 'manual',
      });

      if (historyError) console.error('Price history save failed:', historyError.message);
    })();

    return id;
  };

  const addOffer = (productId: string, store: string, price: number) => {
    const offer: Offer = {
      id: uid(),
      productId,
      store,
      price,
      source: 'manual',
    };

    setOffers(old => [offer, ...old]);

    if (!isUuid(productId)) return;

    void (async () => {
      const { error } = await supabase.from('offers').insert({
        id: offer.id,
        product_id: productId,
        store,
        price,
        source: 'manual',
      });

      if (error) console.error('Offer save failed:', error.message);
    })();
  };

  const addPricePoint = (productId: string, price: number) => {
    const point: PricePoint = {
      id: uid(),
      productId,
      date: new Date().toISOString(),
      price,
      source: 'manual',
    };

    setHistory(old => [point, ...old]);

    if (!isUuid(productId)) return;

    void (async () => {
      const { error } = await supabase.from('price_points').insert({
        id: point.id,
        product_id: productId,
        price,
        source: 'manual',
      });

      if (error) console.error('Price history save failed:', error.message);
    })();
  };

  const toggleWishlist = (id: string) => {
    const exists = wishlist.some(item => item.productId === id);

    setWishlist(old => exists
      ? old.filter(item => item.productId !== id)
      : [...old, { productId: id, addedAt: new Date().toISOString() }]);

    if (!isUuid(id)) return;

    void (async () => {
      if (exists) {
        const { error } = await supabase.from('wishlist')
          .delete().eq('product_id', id);

        if (error) console.error('Wishlist removal failed:', error.message);
      } else {
        const { error } = await supabase.from('wishlist').insert({
          product_id: id,
        });

        if (error) console.error('Wishlist save failed:', error.message);
      }
    })();
  };

  const addToCart = (id: string, store: string, price: number) => {
    const exists = cart.some(item => item.productId === id && item.store === store);

    setCart(old => exists
      ? old.map(item => item.productId === id && item.store === store
        ? { ...item, qty: item.qty + 1 }
        : item)
      : [...old, { productId: id, store, price, qty: 1 }]);

    if (!isUuid(id)) return;

    const current = cart.find(item => item.productId === id && item.store === store);

    void (async () => {
      const { error } = await supabase.from('cart_items').upsert({
        product_id: id,
        store,
        price,
        qty: (current?.qty ?? 0) + 1,
      });

      if (error) console.error('Cart save failed:', error.message);
    })();
  };

  const setQty = (id: string, q: number) => {
    const qty = Math.max(1, q);
    setCart(old => old.map(item => item.productId === id ? { ...item, qty } : item));

    if (!isUuid(id)) return;

    void (async () => {
      const { error } = await supabase.from('cart_items')
        .update({ qty }).eq('product_id', id);

      if (error) console.error('Cart quantity update failed:', error.message);
    })();
  };

  const removeFromCart = (id: string) => {
    setCart(old => old.filter(item => item.productId !== id));

    if (!isUuid(id)) return;

    void (async () => {
      const { error } = await supabase.from('cart_items')
        .delete().eq('product_id', id);

      if (error) console.error('Cart removal failed:', error.message);
    })();
  };

  const updateSettings = (s: Settings) => {
    setSettings(s);

    void (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;

      const { error } = await supabase.from('settings').upsert({
        user_id: userId,
        display_name: s.displayName,
        alert_threshold_pct: s.alertThresholdPct,
        email_alerts: s.emailAlerts,
        weekly_digest: s.weeklyDigest,
      });

      if (error) console.error('Settings save failed:', error.message);
    })();
  };

  const resetDemo = () => {
    const demo = demoData();
    setProducts(demo.products);
    setOffers(demo.offers);
    setHistory(demo.history);
    setWishlist([]);
    setCart([]);
  };

  const value: Ctx = {
    products,
    offers,
    history,
    wishlist,
    cart,
    settings,
    addProduct,
    addOffer,
    addPricePoint,
    toggleWishlist,
    addToCart,
    setQty,
    removeFromCart,
    updateSettings,
    resetDemo,
    bestOffer,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}
