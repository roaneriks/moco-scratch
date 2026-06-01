-- ─────────────────────────────────────────────────────────────────────────────
-- Moco Scratch — Supabase schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";


-- ── Artists ──────────────────────────────────────────────────────────────────
create table artists (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  birthplace    text,
  born_year     integer,
  died_year     integer,
  portrait_url  text
);


-- ── Artworks ─────────────────────────────────────────────────────────────────
create table artworks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  year          text not null,
  artist_id     uuid not null references artists(id) on delete cascade,
  description   text,
  technique     text,
  grid_position integer not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);


-- ── Artwork media (main image, reference photos, video) ───────────────────────
create table artwork_media (
  id            uuid primary key default gen_random_uuid(),
  artwork_id    uuid not null references artworks(id) on delete cascade,
  type          text not null check (type in ('main_image', 'reference_photo', 'video')),
  url           text not null,
  display_order integer not null default 0
);


-- ── Artwork materials ─────────────────────────────────────────────────────────
create table artwork_materials (
  id            uuid primary key default gen_random_uuid(),
  artwork_id    uuid not null references artworks(id) on delete cascade,
  label         text not null,
  icon_name     text
);


-- ── Artwork locations ─────────────────────────────────────────────────────────
create table artwork_locations (
  id               uuid primary key default gen_random_uuid(),
  artwork_id       uuid not null references artworks(id) on delete cascade,
  city             text not null,
  country          text not null,
  map_image_url    text,
  creation_period  text
);


-- ── Art movements ─────────────────────────────────────────────────────────────
create table art_movements (
  id              uuid primary key default gen_random_uuid(),
  artwork_id      uuid not null references artworks(id) on delete cascade,
  name            text not null,
  timeline_year   integer,
  pyramid_x       numeric,
  pyramid_y       numeric,
  pyramid_label_a text,
  pyramid_label_b text,
  pyramid_label_c text
);


-- ── Artwork relations (many-to-many, no duplicates) ──────────────────────────
create table artwork_relations (
  artwork_id         uuid not null references artworks(id) on delete cascade,
  related_artwork_id uuid not null references artworks(id) on delete cascade,
  primary key (artwork_id, related_artwork_id)
);


-- ── Visitor sessions ─────────────────────────────────────────────────────────
create table sessions (
  id               uuid primary key default gen_random_uuid(),
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  language         text,
  user_agent       text,
  duration_seconds integer
);


-- ── Artwork picks (which artworks a session selected) ────────────────────────
create table artwork_picks (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  artwork_id  uuid not null references artworks(id) on delete cascade,
  pick_order  integer not null,
  picked_at   timestamptz not null default now()
);


-- ── Analytics events ─────────────────────────────────────────────────────────
create table events (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid,
  event_type  text not null,
  screen_name text,
  timestamp   timestamptz not null default now(),
  metadata    jsonb
);


-- ── Email captures ────────────────────────────────────────────────────────────
create table emails (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid,
  email        text not null,
  collected_at timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

-- Public read access for content tables (the scratch card app needs these)
alter table artists          enable row level security;
alter table artworks         enable row level security;
alter table artwork_media    enable row level security;
alter table artwork_materials enable row level security;
alter table artwork_locations enable row level security;
alter table art_movements    enable row level security;
alter table artwork_relations enable row level security;

create policy "Public read" on artists          for select using (true);
create policy "Public read" on artworks         for select using (active = true);
create policy "Public read" on artwork_media    for select using (true);
create policy "Public read" on artwork_materials for select using (true);
create policy "Public read" on artwork_locations for select using (true);
create policy "Public read" on art_movements    for select using (true);
create policy "Public read" on artwork_relations for select using (true);

-- Visitor data — public insert only, no read (dashboard uses service role)
alter table sessions      enable row level security;
alter table artwork_picks enable row level security;
alter table events        enable row level security;
alter table emails        enable row level security;

create policy "Public insert" on sessions      for insert with check (true);
create policy "Public insert" on artwork_picks for insert with check (true);
create policy "Public insert" on events        for insert with check (true);
create policy "Public insert" on emails        for insert with check (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- Useful indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index on artworks         (grid_position);
create index on artworks         (artist_id);
create index on artwork_picks    (session_id);
create index on artwork_picks    (artwork_id);
create index on events           (session_id);
create index on events           (event_type);
create index on events           (timestamp desc);
