-- SQL Migration to add Ultimate Form image to the aliens table
-- Safe to run in: Supabase Dashboard → SQL Editor → Run

ALTER TABLE aliens ADD COLUMN IF NOT EXISTS ultimate_image_url TEXT;
