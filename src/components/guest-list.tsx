'use client'

import { useState } from 'react'
import type { RsvpRow } from '@/data/rsvps'
import { CheckInToggle } from '@/components/check-in-toggle'
import { RemoveRsvpButton } from '@/components/remove-rsvp-button'

type GuestListProps = {
  rsvps: RsvpRow[]
  eventId: string
}

export function GuestList({ rsvps, eventId }: GuestListProps) {
  const [filter, setFilter] = useState('')

  const filtered =
    filter.trim() === ''
      ? rsvps
      : rsvps.filter((r) =>
          r.guest_name.toLowerCase().includes(filter.trim().toLowerCase())
        )

  return (
    <div className="space-y-4">
      {/* Name filter */}
      <div className="relative">
        <label htmlFor="guest-filter" className="sr-only">
          Filter by guest name
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg
            className="w-4 h-4 text-zinc-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </div>
        <input
          id="guest-filter"
          type="search"
          placeholder="Filter by name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full min-h-[44px] pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 transition"
        />
      </div>

      {/* Results count when filtering */}
      {filter.trim() !== '' && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-1">
          {filtered.length === 0
            ? 'No guests match that name.'
            : `Showing ${filtered.length} of ${rsvps.length} guest${rsvps.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* Guest rows */}
      {filtered.length === 0 && filter.trim() === '' ? (
        <div className="text-center py-14 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-zinc-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
            No RSVPs yet
          </h3>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Share your event link and guests will appear here once they RSVP.
          </p>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {filtered.map((rsvp) => (
            <li
              key={rsvp.id}
              className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
            >
              <div className="p-3 sm:p-4">
                <CheckInToggle
                  rsvpId={rsvp.id}
                  eventId={eventId}
                  guestName={rsvp.guest_name}
                  partySize={rsvp.party_size}
                  checkedIn={rsvp.checked_in}
                />
                <div className="mt-2.5 flex items-center justify-between gap-2 pl-1">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[60%]">
                    {rsvp.contact}
                  </span>
                  <RemoveRsvpButton
                    rsvpId={rsvp.id}
                    eventId={eventId}
                    guestName={rsvp.guest_name}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

