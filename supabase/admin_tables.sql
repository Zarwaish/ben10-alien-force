-- admin_tables.sql - create admin tables and RLS policies for Ben10 project

-- 1. admin_users table (links to Supabase auth users)
create table if not exists admin_users (
  id uuid primary key references auth.users not null,
  email text unique not null,
  created_at timestamp default now()
);

-- 2. aliens table (if not already existing, create; otherwise alter)
create table if not exists aliens (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  species text,
  planet text,
  power text,
  image_url text,
  watch_type text not null check (watch_type in ('omnitrix','ultimatrix','both')),
  order_index integer not null default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 3. transformations table
create table if not exists transformations (
  id uuid primary key default uuid_generate_v4(),
  alien_id uuid references aliens(id) on delete cascade,
  name text not null,
  description text,
  image_url text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable Row Level Security for admin tables
-- Enable Row Level Security for admin tables only
alter table admin_users enable row level security;
-- Do NOT enable RLS on aliens or transformations to keep public read access


-- Policies: only admin users (present in admin_users) can manage tables
create policy "admin can manage admin_users" on admin_users
  for all using (exists (select 1 from auth.users where id = auth.uid()))
  with check (exists (select 1 from auth.users where id = auth.uid()));

create policy "admin can manage aliens" on aliens
  for all using (exists (select 1 from admin_users where id = auth.uid()));

create policy "admin can manage transformations" on transformations
  for all using (exists (select 1 from admin_users where id = auth.uid()));

-- Optionally, allow read access for all authenticated users (if needed)
-- create policy "authenticated can read aliens" on aliens for select using (auth.role() = 'authenticated');

-- End of admin_tables.sql
