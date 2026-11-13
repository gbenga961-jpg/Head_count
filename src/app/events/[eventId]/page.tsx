import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicEvent } from '@/data/events'
import { PublicRsvpForm } from '@/components/public-rsvp-form'

export const instant = false

type PageProps = {
  params: Promise<{ eventId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params
  const event = await getPublicEvent(eventId)

  if (!event) {
    return {
      title: 'Event Not Found - HeadCount',
      description: 'This event link was not found.',
    }
  }

  return {
    title: `${event.title} - HeadCount`,
    description: event.description || `RSVP to ${event.title}`,
  }
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    })
  } catch {
    return isoString
  }
}

async function EventDetailsContent({ eventId }: { eventId: string }) {
  const event = await getPublicEvent(eventId)

  if (!event) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 max-w-md mx-auto my-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
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
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          This link was not found.
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          The event you are looking for does not exist, has expired, or the link is invalid.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition"
          >
            Go to HeadCount
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Event Details Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
        <div className="inline-block px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
          Event Invitation
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {event.title}
        </h1>

        <div className="mt-5 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="flex-1">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                {formatDate(event.date)}
              </span>
            </div>
          </div>

          {/* Venue */}
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="flex-1">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                {event.venue}
              </span>
            </div>
          </div>

          {/* Capacity Context */}
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-zinc-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-zinc-600 dark:text-zinc-400">
              Capacity: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{event.capacity} total spots</span>
            </span>
          </div>

          {/* Description */}
          {event.description && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RSVP Form Card */}
      <PublicRsvpForm eventId={eventId} capacity={event.capacity} />
    </div>
  )
}

export default async function PublicEventPage({ params }: PageProps) {
  const { eventId } = await params

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black py-8 sm:py-12 px-4 sm:px-6">
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-zinc-500">
            Loading event details...
          </div>
        }
      >
        <EventDetailsContent eventId={eventId} />
      </Suspense>
    </main>
  )
}

