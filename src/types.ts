// Mirrors supabase/schema.sql. Replace in-memory store with Supabase queries later.
export type DataSource='demo'|'manual'; // 'live' will be added once a real, permitted price source is configured
export interface Product{id:string;name:string;brand:string;category:string;targetPrice?:number;source:DataSource;createdAt:string}
export interface Offer{id:string;productId:string;store:string;price:number;url?:string;source:DataSource}
export interface PricePoint{id:string;productId:string;date:string;price:number;source:DataSource}
export interface WishlistItem{productId:string;addedAt:string}
export interface CartItem{productId:string;store:string;price:number;qty:number}
export interface Settings{displayName:string;alertThresholdPct:number;emailAlerts:boolean;weeklyDigest:boolean}
