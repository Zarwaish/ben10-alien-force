-- Migration: Add admin schema for dynamic admin panel
-- Run this SQL in Supabase SQL editor

-- 1. Add enabled column to aliens
ALTER TABLE public.aliens
  ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT true;

-- 2. Create watches table
CREATE TABLE IF NOT EXISTS public.watches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('omnitrix', 'ultimatrix'))
);

-- 3. Create transformations table
CREATE TABLE IF NOT EXISTS public.transformations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alien_id uuid REFERENCES public.aliens(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  description text,
  created_at timestamp DEFAULT now()
);

-- 4. Create admin_activity table
CREATE TABLE IF NOT EXISTS public.admin_activity (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  timestamp timestamp DEFAULT now()
);

-- 5. Ensure watches relationship for alien watch type (existing watch_type column already present)

-- Refresh schema cache (run this after applying migration)
SELECT supabase_functions.refresh_schema_cache();
