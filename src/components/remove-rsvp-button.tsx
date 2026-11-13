'use client'

import { useState, useTransition } from 'react'
import { removeRsvp } from '@/app/actions/rsvps'

type RemoveRsvpButtonProps = {
  rsvpId: string
  eventId: string
  guestName: string
}

export function RemoveRsvpButton({
  rsvpId,
  eventId,
  guestName,
}: RemoveRsvpButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleInitialClick() {
    setConfirming(true)
    setError(null)
  }

  function handleCancel() {
    setConfirming(false)
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await removeRsvp(rsvpId, eventId)
      if (!result.success) {
        setError(result.error ?? 'Failed to remove RSVP.')
        setConfirming(false)
      }
      // On success, the page revalidates — no local state update needed
    })
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-700 dark:text-zinc-300">
          Remove <span className="font-semibold">{guestName}</span> from the
          guest list?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="min-h-[36px] flex-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {isPending ? 'Removing…' : 'Yes, remove'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="min-h-[36px] flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={handleInitialClick}
      aria-label={`Remove ${guestName} from guest list`}
      className="min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:border-red-300 hover:text-red-600 dark:hover:border-red-700 dark:hover:text-red-400 transition-colors"
    >
      Remove
    </button>
  )
}

