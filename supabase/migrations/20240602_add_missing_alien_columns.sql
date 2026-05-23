-- Migration: Add missing columns to aliens table
-- Run this SQL against your Supabase database

ALTER TABLE public.aliens
  ADD COLUMN IF NOT EXISTS abilities text[],
  ADD COLUMN IF NOT EXISTS watch_category text,
  ADD COLUMN IF NOT EXISTS description text;

-- Note: species, planet, image_url, order_index already exist.
