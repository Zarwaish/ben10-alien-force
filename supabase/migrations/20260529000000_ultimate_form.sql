-- Migration: Add ultimate_image_url to aliens table
-- Run this SQL against your Supabase database

ALTER TABLE public.aliens
  ADD COLUMN IF NOT EXISTS ultimate_image_url TEXT;
