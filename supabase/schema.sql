-- Persistent application state for Housekeeping Stock.
-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.app_state (
  id integer primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Only the server-side Supabase secret/service-role key may read or write this table.
revoke all on table public.app_state from anon, authenticated;
grant all on table public.app_state to service_role;
