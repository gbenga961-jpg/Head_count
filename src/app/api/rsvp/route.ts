import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        success: false,
        error_code: 'INVALID_INPUT',
        message: 'Invalid JSON request payload.',
      },
      { status: 400 }
    )
  }

  // Normalize and parse input fields (support both camelCase and snake_case)
  const rawEventId = body.eventId ?? body.event_id
  const rawGuestName = body.guestName ?? body.guest_name ?? body.name
  const rawContact = body.contact
  const rawPartySize = body.partySize ?? body.party_size

  // 1. Validate event identifier
  if (
    !rawEventId ||
    typeof rawEventId !== 'string' ||
    !UUID_REGEX.test(rawEventId.trim())
  ) {
    return NextResponse.json(
      {
        success: false,
        error_code: 'EVENT_NOT_FOUND',
        message: 'This link was not found.',
      },
      { status: 404 }
    )
  }
  const eventId = rawEventId.trim()

  // 2. Validate guest name
  if (
    !rawGuestName ||
    typeof rawGuestName !== 'string' ||
    rawGuestName.trim().length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        error_code: 'INVALID_INPUT',
        message: 'Guest name is required.',
      },
      { status: 400 }
    )
  }
  const guestName = rawGuestName.trim()

  // 3. Validate contact (trim whitespace; do not normalize punctuation per capacity-rules)
  if (
    !rawContact ||
    typeof rawContact !== 'string' ||
    rawContact.trim().length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        error_code: 'INVALID_INPUT',
        message: 'Contact is required.',
      },
      { status: 400 }
    )
  }
  const contact = rawContact.trim()

  // 4. Validate party size (whole number from 1 to 10)
  const partySize = Number(rawPartySize)
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 10) {
    return NextResponse.json(
      {
        success: false,
        error_code: 'INVALID_INPUT',
        message: 'Party size must be a whole number between 1 and 10.',
      },
      { status: 400 }
    )
  }

  // 5. Call the capacity-safe database function
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('submit_rsvp', {
    p_event_id: eventId,
    p_guest_name: guestName,
    p_contact: contact,
    p_party_size: partySize,
  })

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error_code: 'SERVER_ERROR',
        message: 'Your RSVP was not saved. Try again.',
      },
      { status: 500 }
    )
  }

  // 6. Return mapped responses based on database function results
  if (data.success === true) {
    return NextResponse.json(
      {
        success: true,
        message: data.message ?? 'Your RSVP has been confirmed!',
        spots_left: data.spots_left,
      },
      { status: 201 }
    )
  }

  // Handle specific refusal and failure states
  switch (data.error_code) {
    case 'EVENT_NOT_FOUND':
      return NextResponse.json(
        {
          success: false,
          error_code: 'EVENT_NOT_FOUND',
          message: 'This link was not found.',
        },
        { status: 404 }
      )

    case 'EVENT_FULL':
      return NextResponse.json(
        {
          success: false,
          error_code: 'EVENT_FULL',
          message: 'The event is full.',
          spots_left: 0,
        },
        { status: 409 }
      )

    case 'PARTY_TOO_LARGE':
      return NextResponse.json(
        {
          success: false,
          error_code: 'PARTY_TOO_LARGE',
          message: 'Your party is larger than the spots left.',
          spots_left: data.spots_left,
        },
        { status: 409 }
      )

    case 'DUPLICATE_CONTACT':
      return NextResponse.json(
        {
          success: false,
          error_code: 'DUPLICATE_CONTACT',
          message:
            'You have already RSVPed with this contact. Ask the host to change it.',
        },
        { status: 409 }
      )

    case 'EVENT_ENDED':
      return NextResponse.json(
        {
          success: false,
          error_code: 'EVENT_ENDED',
          message: 'This event has ended.',
        },
        { status: 410 }
      )

    case 'INVALID_NAME':
    case 'INVALID_CONTACT':
    case 'INVALID_PARTY_SIZE':
    default:
      return NextResponse.json(
        {
          success: false,
          error_code: data.error_code ?? 'INVALID_INPUT',
          message: data.message ?? 'Your RSVP was not saved. Try again.',
        },
        { status: 400 }
      )
  }
}

