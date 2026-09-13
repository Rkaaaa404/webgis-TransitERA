---
name: supabase-database
description: Guide for integrating Supabase (PostgreSQL 16 + PostGIS) in TransitERA WebGIS. Covers connection pooling for FastAPI, schema migrations, spatial indexing (GIST / H3), Row-Level Security (RLS) policies, and security advisors.
license: MIT
---

# Supabase PostGIS & Database Guide for TransitERA

Integration guide for connecting TransitERA FastAPI backend and WebGIS queries to Supabase Managed PostgreSQL with PostGIS.

## 1. Connection Architecture

TransitERA connects to Supabase via SQLAlchemy + GeoAlchemy2 or asyncpg:
- **Direct Connection (Migrations & DDL)**: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
- **Transaction Pooler (FastAPI Serverless / High Concurrency)**: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require`

In FastAPI `.env`:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?sslmode=require
```

## 2. Spatial PostGIS Extensions
Ensure the necessary spatial extensions are enabled in Supabase:
```sql
-- Enable PostGIS and topology
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Optional: pg_trgm for fast text search on station/POI names
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

## 3. Spatial Indexing Best Practices
Always create GIST indexes on spatial geometry columns to accelerate bounding box queries and ST_DWithin:
```sql
-- GIST index for station points
CREATE INDEX IF NOT EXISTS idx_transit_stations_geom 
ON transit_stations USING GIST (geom);

-- B-Tree index on Uber H3 hexagon index
CREATE INDEX IF NOT EXISTS idx_tod_scores_h3_index 
ON tod_scores (h3_index);
```

## 4. Row-Level Security (RLS) Checklist
When exposing Supabase directly to client libraries or REST Data API:
- **Enable RLS** on all public tables:
  ```sql
  ALTER TABLE public.transit_stations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tod_scores ENABLE ROW LEVEL SECURITY;
  ```
- **Read-Only Public Access Policy** for WebGIS layers:
  ```sql
  CREATE POLICY "Allow public read-only access to stations"
  ON public.transit_stations
  FOR SELECT TO anon, authenticated
  USING (true);
  ```
- **Survey Activities Mutation Policy** (PakSibukGa crowdsourced survey):
  ```sql
  CREATE POLICY "Allow authenticated or anon insert for surveys"
  ON public.survey_activities
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
  ```

## 5. Security & Verification
- Run `supabase db advisors` or check Dashboard Security Advisors to audit missing indexes or RLS bypasses.
- Never commit database passwords or `service_role` keys into git.
- Verify fallback behavior: TransitERA backend must fall back cleanly to in-memory GeoDataFrames when `DATABASE_URL` is unconfigured.
