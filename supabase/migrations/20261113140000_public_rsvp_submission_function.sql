-- Migration: Public RSVP submission database function
-- Safe against simultaneous submissions via row locking (FOR UPDATE)
-- Validates required fields, positive party size, and remaining capacity
-- Ensures checked_in is always false and exposes no guest-list read access

create or replace function public.submit_rsvp(
  p_event_id uuid,
  p_guest_name text,
  p_contact text,
  p_party_size integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_guest_name text;
  v_contact text;
  v_capacity integer;
  v_event_date timestamptz;
  v_booked integer;
  v_spots_left integer;
  v_rsvp_id uuid;
begin
  -- 1. Validate required guest fields
  v_guest_name := trim(p_guest_name);
  if v_guest_name is null or char_length(v_guest_name) = 0 then
    return jsonb_build_object(
      'success', false,
      'error_code', 'INVALID_NAME',
      'message', 'Guest name is required.'
    );
  end if;

  v_contact := trim(p_contact);
  if v_contact is null or char_length(v_contact) = 0 then
    return jsonb_build_object(
      'success', false,
      'error_code', 'INVALID_CONTACT',
      'message', 'Contact is required.'
    );
  end if;

  -- 2. Validate party size (whole number from 1 to 10 per capacity-rules.md)
  if p_party_size is null or p_party_size < 1 or p_party_size > 10 then
    return jsonb_build_object(
      'success', false,
      'error_code', 'INVALID_PARTY_SIZE',
      'message', 'Party size must be a whole number between 1 and 10.'
    );
  end if;

  -- 3. Lock event row to guarantee concurrency safety against simultaneous submissions
  select capacity, event_date
  into v_capacity, v_event_date
  from public.events
  where id = p_event_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error_code', 'EVENT_NOT_FOUND',
      'message', 'This link was not found.'
    );
  end if;

  -- 4. Check if event has ended
  if now() >= v_event_date then
    return jsonb_build_object(
      'success', false,
      'error_code', 'EVENT_ENDED',
      'message', 'This event has ended.'
    );
  end if;

  -- 5. Check for duplicate contact on this event (case-insensitive, trimmed)
  if exists (
    select 1
    from public.rsvps
    where event_id = p_event_id
      and lower(trim(contact)) = lower(v_contact)
  ) then
    return jsonb_build_object(
      'success', false,
      'error_code', 'DUPLICATE_CONTACT',
      'message', 'You have already RSVPed with this contact. Ask the host to change it.'
    );
  end if;

  -- 6. Recalculate spots left from booked party sizes
  select coalesce(sum(party_size), 0)
  into v_booked
  from public.rsvps
  where event_id = p_event_id;

  v_spots_left := v_capacity - v_booked;

  -- 7. Check capacity: refuse if full or if party does not fit
  if v_spots_left <= 0 then
    return jsonb_build_object(
      'success', false,
      'error_code', 'EVENT_FULL',
      'message', 'The event is full.',
      'spots_left', 0
    );
  end if;

  if p_party_size > v_spots_left then
    return jsonb_build_object(
      'success', false,
      'error_code', 'PARTY_TOO_LARGE',
      'message', 'Your party is larger than the spots left.',
      'spots_left', v_spots_left
    );
  end if;

  -- 8. Insert the RSVP. checked_in is strictly set to false and cannot be altered.
  insert into public.rsvps (
    event_id,
    guest_name,
    contact,
    party_size,
    checked_in
  ) values (
    p_event_id,
    v_guest_name,
    v_contact,
    p_party_size,
    false
  )
  returning id into v_rsvp_id;

  return jsonb_build_object(
    'success', true,
    'rsvp_id', v_rsvp_id,
    'spots_left', v_spots_left - p_party_size,
    'message', 'Your RSVP has been confirmed!'
  );
end;
$$;

-- Grant execution to anon and authenticated callers
revoke all on function public.submit_rsvp(uuid, text, text, integer) from public;
grant execute on function public.submit_rsvp(uuid, text, text, integer) to anon, authenticated;

