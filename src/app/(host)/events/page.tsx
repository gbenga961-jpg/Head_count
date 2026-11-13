import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getHostEvents, type HostEventItem } from '@/data/events'

export const metadata: Metadata = {
  title: 'My Events - HeadCount',
  description: 'Manage your events and guest lists',
}

export const instant = false

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    })
  } catch {
    return isoString
  }
}

async function EventsList() {
  const events = await getHostEvents()

  if (events.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          No events yet
        </h2>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          You haven&apos;t created any events. Create your first event to start collecting RSVPs and tracking guest arrivals.
        </p>
        <div className="mt-6">
          <Link
            href="/events/new"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Create Your First Event
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      {events.map((event: HostEventItem) => (
        <div
          key={event.id}
          className="p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {event.title}
            </h2>

            <div className="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(event.event_date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                <span className="truncate">{event.venue}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{event.capacity} total spots</span>
              </div>

              {event.description && (
                <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          </div>

          {/* Navigation Action Links */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <Link
              href={`/events/${event.id}/guests`}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Guest List
            </Link>
            <Link
              href={`/events/${event.id}/edit`}
              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MyEventsPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            My Events
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            See your events, check guest lists, and copy public invite links.
          </p>
        </div>

        <Link
          href="/events/new"
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium transition-opacity hover:opacity-90 self-start sm:self-auto"
        >
          + Create Event
        </Link>
      </div>

      {/* Events List streamed via Suspense */}
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-zinc-500">
            Loading your events...
          </div>
        }
      >
        <EventsList />
      </Suspense>
    </div>
  )
}
