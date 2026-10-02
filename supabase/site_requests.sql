-- Run this once in the Supabase SQL Editor.
-- Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server/Vercel environment.
-- Keep SUPABASE_SERVICE_ROLE_KEY server-side; never expose it as a VITE_ variable.
create table if not exists public.site_requests (
  id text primary key default ('request-' || gen_random_uuid()::text),
  site_name text not null,
  site_url text not null,
  why_add text not null default '',
  regions_sections jsonb not null default '[]'::jsonb,
  created_by text not null default 'anonymous',
  status text not null default 'pending' check (status in ('pending', 'added')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.site_requests enable row level security;
revoke all on public.site_requests from anon, authenticated;
grant all on public.site_requests to service_role;

create table if not exists public.catalog_items (
  id text primary key,
  request_id text unique,
  item_data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.catalog_items enable row level security;
revoke all on public.catalog_items from anon, authenticated;
grant all on public.catalog_items to service_role;
