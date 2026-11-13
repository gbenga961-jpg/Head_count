import { createClient } from '@/utils/supabase/server'
import { requireHostUser } from '@/lib/auth'

export type RsvpRow = {
  id: string
  guest_name: string
  contact: string
  party_size: number
  checked_in: boolean
  created_at: string
}

export type GuestListTotals = {
  rsvp_count: number
  total_guests: number
  checked_in_guests: number
  spots_left: number
}

export type EventGuestList = {
  event_id: string
  event_title: string
  rsvps: RsvpRow[]
  totals: GuestListTotals
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Server-side data function to retrieve the guest list for a host-owned event.
 * Enforces host ownership: verifies that the authenticated user owns the event
 * via a database-level ownership check on the events table.
 *
 * Returns null if the event is not found, the user is not the owner, or the
 * event ID is invalid.
 *
 * Returns guest names, party sizes, contact info (host-visible), check-in
 * state, and computed totals. Never exposes owner account data to browsers.
 */
export async function getEventGuestList(
  eventId: string | null | undefined
): Promise<EventGuestList | null> {
  if (!eventId || typeof eventId !== 'string') {
    return null
  }

  const trimmedId = eventId.trim()
  if (!UUID_REGEX.test(trimmedId)) {
    return null
  }

  // Enforce host authentication — redirects to /login if not authenticated
  const user = await requireHostUser()
  const supabase = await createClient()

  // Fetch the event and enforce ownership in the same query
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, title, capacity')
    .eq('id', trimmedId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (eventError || !event) {
    return null
  }

  // Fetch RSVPs for this event
  const { data: rsvps, error: rsvpError } = await supabase
    .from('rsvps')
    .select('id, guest_name, contact, party_size, checked_in, created_at')
    .eq('event_id', trimmedId)
    .order('created_at', { ascending: true })

  if (rsvpError) {
    return null
  }

  const rows: RsvpRow[] = (rsvps ?? []).map((r) => ({
    id: r.id as string,
    guest_name: r.guest_name as string,
    contact: r.contact as string,
    party_size: r.party_size as number,
    checked_in: r.checked_in as boolean,
    created_at: r.created_at as string,
  }))

  // Compute totals server-side — never stored as a column
  const total_guests = rows.reduce((sum, r) => sum + r.party_size, 0)
  const checked_in_guests = rows
    .filter((r) => r.checked_in)
    .reduce((sum, r) => sum + r.party_size, 0)
  const spots_left = Math.max(0, event.capacity - total_guests)

  return {
    event_id: event.id as string,
    event_title: event.title as string,
    rsvps: rows,
    totals: {
      rsvp_count: rows.length,
      total_guests,
      checked_in_guests,
      spots_left,
    },
  }
}

