/*
  Migration: create public.watches table
  Run this SQL in Supabase SQL editor or via supabase CLI.
*/

create table if not exists public.watches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null check (type in ('omnitrix', 'ultimatrix', 'both')),
  order_index integer not null,
  image_url text,
  status text not null default 'available'
);

-- Enable row level security (optional, can be configured later)
alter table public.watches enable row level security;

-- Grant public select (for simple read access)
grant select on public.watches to anon;
