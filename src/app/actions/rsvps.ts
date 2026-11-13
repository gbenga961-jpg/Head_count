'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { verifyHostActionAuth } from '@/lib/auth'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value.trim())
}

export type RsvpActionResult = {
  success: boolean
  error?: string
}

/**
 * Server action to toggle the check-in state of an RSVP.
 * Enforces host ownership: verifies that the authenticated user owns the event
 * associated with the RSVP via a database-level JOIN check.
 * Revalidates the guest list page after a successful update.
 */
export async function toggleCheckIn(
  rsvpId: string,
  eventId: string,
  checkedIn: boolean
): Promise<RsvpActionResult> {
  const { user, error: authError } = await verifyHostActionAuth()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  if (!isValidUUID(rsvpId) || !isValidUUID(eventId)) {
    return { success: false, error: 'Invalid request.' }
  }

  const supabase = await createClient()

  // Verify event ownership before updating
  const { data: ownedEvent, error: ownershipError } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId.trim())
    .eq('owner_id', user.id)
    .maybeSingle()

  if (ownershipError || !ownedEvent) {
    return { success: false, error: 'Event not found or access denied.' }
  }

  // Update check-in state, scoped to the verified event
  const { error } = await supabase
    .from('rsvps')
    .update({ checked_in: checkedIn })
    .eq('id', rsvpId.trim())
    .eq('event_id', eventId.trim())

  if (error) {
    return { success: false, error: 'Failed to update check-in status.' }
  }

  revalidatePath(`/events/${eventId.trim()}/guests`)
  return { success: true }
}

/**
 * Server action to remove (delete) an RSVP.
 * Enforces host ownership: verifies that the authenticated user owns the event
 * via a database-level ownership check before deleting.
 * Revalidates the guest list page after a successful deletion.
 */
export async function removeRsvp(
  rsvpId: string,
  eventId: string
): Promise<RsvpActionResult> {
  const { user, error: authError } = await verifyHostActionAuth()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  if (!isValidUUID(rsvpId) || !isValidUUID(eventId)) {
    return { success: false, error: 'Invalid request.' }
  }

  const supabase = await createClient()

  // Verify event ownership first before deleting
  const { data: ownedEvent, error: ownershipError } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId.trim())
    .eq('owner_id', user.id)
    .maybeSingle()

  if (ownershipError || !ownedEvent) {
    return { success: false, error: 'Event not found or access denied.' }
  }

  const { error } = await supabase
    .from('rsvps')
    .delete()
    .eq('id', rsvpId.trim())
    .eq('event_id', eventId.trim())

  if (error) {
    return { success: false, error: 'Failed to remove RSVP.' }
  }

  revalidatePath(`/events/${eventId.trim()}/guests`)
  return { success: true }
}
