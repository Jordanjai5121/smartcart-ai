-- Run in Supabase SQL editor. Single-user app: every row is owned by auth.uid().
create table products(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references auth.users,name text not null,brand text,category text,target_price numeric(12,2),source text not null default 'manual' check(source in('demo','manual','live')),created_at timestamptz default now());
create table offers(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),product_id uuid references products on delete cascade,store text not null,price numeric(12,2) not null,url text,source text not null default 'manual',created_at timestamptz default now());
create table price_points(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),product_id uuid references products on delete cascade,price numeric(12,2) not null,recorded_at timestamptz default now(),source text not null default 'manual');
create table wishlist(user_id uuid default auth.uid(),product_id uuid references products on delete cascade,added_at timestamptz default now(),primary key(user_id,product_id));
create table cart_items(user_id uuid default auth.uid(),product_id uuid references products on delete cascade,store text,price numeric(12,2),qty int default 1 check(qty>0),primary key(user_id,product_id,store));
create table settings(user_id uuid primary key default auth.uid(),display_name text,alert_threshold_pct int default 10,email_alerts bool default false,weekly_digest bool default false);
do $$ declare t text; begin foreach t in array array['products','offers','price_points','wishlist','cart_items','settings'] loop
 execute format('alter table %I enable row level security',t);
 execute format('create policy own_%1$s on %1$I for all using(user_id=auth.uid()) with check(user_id=auth.uid())',t); end loop; end $$;
