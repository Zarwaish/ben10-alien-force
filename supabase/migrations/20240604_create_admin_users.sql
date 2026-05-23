-- Migration: Create admin_users table for admin authentication
-- Run this SQL in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Optional: Insert the initial admin user (replace with real UUID after creating via Supabase Auth)
-- INSERT INTO public.admin_users (id, email) VALUES ('<ADMIN_USER_UUID>', 'admin@gmail.com');

SELECT supabase_functions.refresh_schema_cache();
