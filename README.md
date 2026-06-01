# Moco Scratch

A digital scratch card experience for Moco Museum Barcelona. Visitors scan a QR code during their visit, pick their favourite artworks from the collection, and unlock a personalised art story — complete with a scratch-to-reveal moment and an Instagram share screen.

---

## What's in this repo

| Path | What it is |
|------|------------|
| `index.html` | Visitor-facing scratch card app (single-file React, CDN) |
| `dashboard/` | Staff analytics & collection CMS (React + Vite + Tailwind) |
| `supabase/` | Database schema, seed data, and RLS policies |
| `images/` | Artwork photos, artist portraits, and map images |

---

## Running locally

### Visitor app
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000/moco-scratch/](http://localhost:8000/moco-scratch/) — or serve directly from the `moco-scratch/` folder:
```bash
cd /path/to/moco-scratch
python3 -m http.server 8000
# open http://localhost:8000
```

### Dashboard
```bash
cd dashboard
npm install
npm run dev
# opens at http://localhost:5174
```

---

## Deploying to Vercel

The visitor app and the dashboard are **two separate Vercel projects** — deploy them independently.

### 1 · Visitor app (static site)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the `roaneriks/moco-scratch` repository
3. Set **Root Directory** to `/` (repo root)
4. Framework preset: **Other**
5. No build command needed — Vercel serves `index.html` directly via `vercel.json`
6. Deploy

### 2 · Dashboard (Vite/React)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the same `roaneriks/moco-scratch` repository
3. Set **Root Directory** to `dashboard`
4. Framework preset: **Vite** (auto-detected)
5. Add the required environment variables (see below)
6. Deploy

---

## Environment variables

The dashboard reads Supabase credentials from environment variables. For local development it falls back to the hardcoded values — for production set these in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

Copy `dashboard/.env.example` to `dashboard/.env.local` for local overrides:
```bash
cp dashboard/.env.example dashboard/.env.local
# then fill in your values
```

---

## Supabase setup

Run the files in order against your Supabase project (SQL editor or CLI):

```
supabase/schema.sql      — creates all tables + RLS policies
supabase/seed.sql        — inserts the 15 artworks + 8 artists
supabase/rls_policies.sql — (already included in schema.sql, apply if needed separately)
```

---

## Tech stack

- **Visitor app** — React 18 (CDN), Babel standalone, no build step
- **Dashboard** — React 18, Vite, Tailwind CSS, Recharts, Supabase JS client, React Router
- **Backend** — Supabase (Postgres + RLS + realtime)
