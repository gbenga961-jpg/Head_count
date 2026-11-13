-- Migration: Enable RLS on events and rsvps with narrowly scoped policies

-- Ensure rsvps table exists so RLS and foreign-key policies can be created
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_name text not null check (char_length(trim(guest_name)) > 0),
  contact text not null check (char_length(trim(contact)) > 0),
  party_size integer not null check (party_size between 1 and 10),
  checked_in boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index event_id on rsvps for lookup performance
create index if not exists rsvps_event_id_idx on public.rsvps (event_id);

-- Enforce unique contact per event (case-insensitive, trimmed)
create unique index if not exists rsvps_event_id_contact_idx
  on public.rsvps (event_id, lower(trim(contact)));

-- -----------------------------------------------------------------------------
-- 1. Events Policies
-- -----------------------------------------------------------------------------
alter table public.events enable row level security;

-- Drop existing policies if any to avoid duplication
drop policy if exists "Hosts can view own events" on public.events;
drop policy if exists "Hosts can insert own events" on public.events;
drop policy if exists "Hosts can update own events" on public.events;
drop policy if exists "Hosts can delete own events" on public.events;
drop policy if exists "Public can read event details" on public.events;
drop policy if exists "Allow public reading of event details" on public.events;

-- Allow public reading only of the event details needed by an invite page
create policy "Public can read event details"
  on public.events
  for select
  to anon
  using (true);

-- Allow authenticated hosts to read only events they own
create policy "Hosts can view own events"
  on public.events
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

-- Allow authenticated hosts to create only events they own
create policy "Hosts can insert own events"
  on public.events
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

-- Allow authenticated hosts to change only events they own
create policy "Hosts can update own events"
  on public.events
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Allow authenticated hosts to delete only events they own
create policy "Hosts can delete own events"
  on public.events
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- -----------------------------------------------------------------------------
-- 2. RSVPs Policies
-- -----------------------------------------------------------------------------
alter table public.rsvps enable row level security;

-- Drop existing policies if any
drop policy if exists "Hosts can view RSVPs for own events" on public.rsvps;
drop policy if exists "Hosts can update RSVPs for own events" on public.rsvps;
drop policy if exists "Hosts can delete RSVPs for own events" on public.rsvps;

-- Allow hosts to read RSVPs only for their own events
create policy "Hosts can view RSVPs for own events"
  on public.rsvps
  for select
  to authenticated
  using (
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
        and events.owner_id = (select auth.uid())
    )
  );

-- Allow hosts to update RSVPs only for their own events (e.g. check-in status)
create policy "Hosts can update RSVPs for own events"
  on public.rsvps
  for update
  to authenticated
  using (
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
        and events.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
        and events.owner_id = (select auth.uid())
    )
  );

-- Allow hosts to remove RSVPs only for their own events
create policy "Hosts can delete RSVPs for own events"
  on public.rsvps
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
        and events.owner_id = (select auth.uid())
    )
  );

-- Direct public inserts into rsvps are deliberately disallowed.
-- Public RSVP creation will be handled via server-side validation to enforce capacity and concurrency constraints.

