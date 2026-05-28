-- Run this in Supabase SQL Editor to fix "violates row-level security policy" error
-- Supabase Dashboard → SQL Editor → New query → Paste → Run

CREATE POLICY "Public insert products"
ON products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update products"
ON products FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public delete products"
ON products FOR DELETE
USING (true);
