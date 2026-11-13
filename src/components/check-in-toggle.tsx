'use client'

import { useTransition } from 'react'
import { toggleCheckIn } from '@/app/actions/rsvps'

type CheckInToggleProps = {
  rsvpId: string
  eventId: string
  guestName: string
  partySize: number
  checkedIn: boolean
}

export function CheckInToggle({
  rsvpId,
  eventId,
  guestName,
  partySize,
  checkedIn,
}: CheckInToggleProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await toggleCheckIn(rsvpId, eventId, !checkedIn)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={
        checkedIn
          ? `Mark ${guestName} as not checked in`
          : `Check in ${guestName}`
      }
      aria-pressed={checkedIn}
      className={[
        // Minimum 52px touch target for phone use
        'min-h-[52px] w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isPending ? 'opacity-60 cursor-wait' : 'cursor-pointer',
        checkedIn
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-500 focus-visible:ring-emerald-500'
          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 focus-visible:ring-zinc-400',
      ].join(' ')}
    >
      {/* Check indicator */}
      <span
        aria-hidden="true"
        className={[
          'shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors',
          checkedIn
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-zinc-300 dark:border-zinc-600 bg-transparent',
        ].join(' ')}
      >
        {checkedIn && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>

      {/* Guest info */}
      <span className="flex-1 min-w-0 text-left">
        <span className="block font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {guestName}
        </span>
        <span
          className={[
            'block text-xs mt-0.5',
            checkedIn
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-500 dark:text-zinc-400',
          ].join(' ')}
        >
          {partySize === 1 ? '1 person' : `${partySize} people`}
          {' · '}
          {checkedIn ? 'Checked in' : 'Not checked in'}
        </span>
      </span>

      {/* Spinner while pending */}
      {isPending && (
        <span aria-hidden="true" className="shrink-0">
          <svg
            className="w-5 h-5 animate-spin text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </span>
      )}
    </button>
  )
}

