-- ─────────────────────────────────────────────────────────────────────────────
-- Moco Scratch — RLS fix policies
-- Run this in the Supabase SQL editor to fix data not flowing through.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Fix 1: sessions — add UPDATE policy so completeSession() can write ───────
-- (INSERT policy "Public insert" already exists from schema.sql; this adds UPDATE)
alter table sessions enable row level security;
create policy "Allow anonymous inserts" on sessions
  for insert with check (true);
create policy "Allow anonymous updates" on sessions
  for update using (true);

-- ── Fix 2: artwork_picks — ensure insert policy exists ───────────────────────
alter table artwork_picks enable row level security;
create policy "Allow anonymous inserts" on artwork_picks
  for insert with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Dashboard read access (anon key)
-- The dashboard uses the anon key, so visitor data tables need SELECT policies.
-- Without these, all dashboard queries return 0 rows.
-- ─────────────────────────────────────────────────────────────────────────────

create policy "Dashboard read" on sessions
  for select using (true);

create policy "Dashboard read" on artwork_picks
  for select using (true);

create policy "Dashboard read" on events
  for select using (true);

create policy "Dashboard read" on emails
  for select using (true);
