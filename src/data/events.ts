import { createClient } from '@/utils/supabase/server'
import { requireHostUser } from '@/lib/auth'

export type PublicEventDetails = {
  title: string
  date: string
  venue: string
  description: string | null
  capacity: number
}

export type HostEventItem = {
  id: string
  owner_id: string
  title: string
  event_date: string
  venue: string
  description: string | null
  capacity: number
  created_at: string
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Server-side data function to retrieve public event details for an invite page.
 * Strictly returns only title, date, venue, description, and capacity.
 * Never fetches or returns RSVP rows, contact details, or host/owner account data.
 * Returns null (not-found result) if the event identifier is invalid or not found.
 */
export async function getPublicEvent(
  identifier: string | null | undefined
): Promise<PublicEventDetails | null> {
  if (!identifier || typeof identifier !== 'string') {
    return null
  }

  const trimmedId = identifier.trim()
  if (!trimmedId) {
    return null
  }

  // Validate identifier format to prevent invalid database syntax errors
  if (!UUID_REGEX.test(trimmedId)) {
    return null
  }

  const supabase = await createClient()

  // Select ONLY public event details needed for the invite page
  const { data, error } = await supabase
    .from('events')
    .select('title, event_date, venue, description, capacity')
    .eq('id', trimmedId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return {
    title: data.title,
    date: data.event_date,
    venue: data.venue,
    description: data.description ?? null,
    capacity: data.capacity,
  }
}

/**
 * Server-side data function to retrieve all events belonging to the signed-in host.
 * Strictly scopes queries to the authenticated user's ID.
 */
export async function getHostEvents(): Promise<HostEventItem[]> {
  const user = await requireHostUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('id, owner_id, title, event_date, venue, description, capacity, created_at')
    .eq('owner_id', user.id)
    .order('event_date', { ascending: true })

  if (error || !data) {
    return []
  }

  return data as HostEventItem[]
}

// Aliases for flexible module resolution
export const getEventByPublicIdentifier = getPublicEvent
export const getPublicEventByIdentifier = getPublicEvent
