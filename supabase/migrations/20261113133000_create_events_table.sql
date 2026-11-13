-- Migration: Create events table
-- Required fields: id (UUID PK), owner_id (references auth.users), title, event_date, venue, optional description, positive integer capacity, created_at.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  event_date timestamptz not null,
  venue text not null check (char_length(trim(venue)) > 0),
  description text,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

-- Index owner_id for host event lookups
create index events_owner_id_idx on public.events (owner_id);

-- Enable Row Level Security (RLS)
alter table public.events enable row level security;

-- Host access policies: hosts can only view and manage their own events
create policy "Hosts can view own events"
  on public.events
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Hosts can insert own events"
  on public.events
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Hosts can update own events"
  on public.events
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Hosts can delete own events"
  on public.events
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

