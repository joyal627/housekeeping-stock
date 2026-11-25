create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
-- No anon/authenticated policies. The server accesses this table using its service-role key.
