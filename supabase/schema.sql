-- Persistent application state for Housekeeping Stock.
-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.housekeeping_app_state (
  id text primary key check (id = 'main'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.housekeeping_app_state enable row level security;

-- Only the server-side Supabase secret/service-role key may read or write this table.
revoke all on table public.housekeeping_app_state from anon, authenticated;
grant all on table public.housekeeping_app_state to service_role;
