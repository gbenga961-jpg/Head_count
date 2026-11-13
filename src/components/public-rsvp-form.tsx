'use client'

import { useState } from 'react'

type PublicRsvpFormProps = {
  eventId: string
  capacity: number
}

type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | {
      status: 'confirmed'
      guestName: string
      partySize: number
      message: string
    }
  | {
      status: 'error'
      errorCode?: string
      message: string
      spotsLeft?: number
    }

export function PublicRsvpForm({ eventId, capacity }: PublicRsvpFormProps) {
  const [guestName, setGuestName] = useState('')
  const [contact, setContact] = useState('')
  const [partySize, setPartySize] = useState('1')
  const [clientErrors, setClientErrors] = useState<{
    guestName?: string
    contact?: string
    partySize?: string
  }>({})
  const [state, setState] = useState<SubmissionState>({ status: 'idle' })

  function validate(): boolean {
    const errors: { guestName?: string; contact?: string; partySize?: string } = {}
    if (!guestName.trim()) {
      errors.guestName = 'Please enter your name.'
    }
    if (!contact.trim()) {
      errors.contact = 'Please enter a phone number or email.'
    }
    const num = parseInt(partySize, 10)
    if (isNaN(num) || num < 1 || num > 10) {
      errors.partySize = 'Number of guests must be between 1 and 10.'
    }
    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setState({ status: 'submitting' })

    const payload = {
      eventId,
      guestName: guestName.trim(),
      contact: contact.trim(),
      partySize: parseInt(partySize, 10),
    }

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json().catch(() => null)

      if (response.ok && result?.success) {
        setState({
          status: 'confirmed',
          guestName: payload.guestName,
          partySize: payload.partySize,
          message: result.message || 'Your RSVP has been confirmed!',
        })
      } else {
        const message =
          result?.message || 'Your RSVP was not saved. Try again.'
        setState({
          status: 'error',
          errorCode: result?.error_code,
          message,
          spotsLeft: typeof result?.spots_left === 'number' ? result.spots_left : undefined,
        })
      }
    } catch {
      setState({
        status: 'error',
        errorCode: 'NETWORK_ERROR',
        message: 'Your RSVP was not saved. Try again.',
      })
    }
  }

  if (state.status === 'confirmed') {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            RSVP Confirmed!
          </h2>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            {state.message}
          </p>
        </div>

        <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
          <p>
            Guest:{' '}
            <span className="font-semibold">{state.guestName}</span> (
            {state.partySize === 1
              ? '1 person'
              : `${state.partySize} people`}
            )
          </p>
          <p className="text-emerald-600 dark:text-emerald-400">
            The host has been notified of your RSVP.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          RSVP to this Event
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          No sign-in required. Enter your details below to save your spot.
        </p>
      </div>

      {state.status === 'error' && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-300"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="space-y-1">
              <p className="font-medium">{state.message}</p>
              {typeof state.spotsLeft === 'number' && (
                <p className="text-xs text-red-700 dark:text-red-400">
                  {state.spotsLeft === 0
                    ? 'There are no spots remaining.'
                    : `Only ${state.spotsLeft} spot${state.spotsLeft === 1 ? '' : 's'} remaining.`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Guest Name */}
        <div>
          <label
            htmlFor="guestName"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            id="guestName"
            name="guestName"
            type="text"
            required
            autoComplete="name"
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value)
              if (clientErrors.guestName) {
                setClientErrors((prev) => ({ ...prev, guestName: undefined }))
              }
            }}
            placeholder="e.g. Alex Morgan"
            disabled={state.status === 'submitting'}
            className="mt-1.5 block w-full min-h-[44px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-60 transition"
          />
          {clientErrors.guestName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {clientErrors.guestName}
            </p>
          )}
        </div>

        {/* Contact Field (phone number or email) */}
        <div>
          <label
            htmlFor="contact"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Contact Information <span className="text-red-500">*</span>
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            required
            autoComplete="email tel"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value)
              if (clientErrors.contact) {
                setClientErrors((prev) => ({ ...prev, contact: undefined }))
              }
            }}
            placeholder="Phone number or email"
            disabled={state.status === 'submitting'}
            className="mt-1.5 block w-full min-h-[44px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-60 transition"
          />
          {clientErrors.contact && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {clientErrors.contact}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            The host will see your name and contact to coordinate event details.
          </p>
        </div>

        {/* Number of guests (party size) */}
        <div>
          <label
            htmlFor="partySize"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Number of Guests <span className="text-red-500">*</span>
          </label>
          <select
            id="partySize"
            name="partySize"
            value={partySize}
            onChange={(e) => {
              setPartySize(e.target.value)
              if (clientErrors.partySize) {
                setClientErrors((prev) => ({ ...prev, partySize: undefined }))
              }
            }}
            disabled={state.status === 'submitting'}
            className="mt-1.5 block w-full min-h-[44px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-60 transition"
          >
            {Array.from({ length: Math.min(10, Math.max(1, capacity)) }, (_, i) => i + 1).map(
              (num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'person (just you)' : 'people (including you)'}
                </option>
              )
            )}
          </select>
          {clientErrors.partySize && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {clientErrors.partySize}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={state.status === 'submitting'}
            className="w-full min-h-[48px] rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-base font-semibold transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {state.status === 'submitting' ? (
              <>
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
                <span>Submitting RSVP...</span>
              </>
            ) : (
              'RSVP'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

