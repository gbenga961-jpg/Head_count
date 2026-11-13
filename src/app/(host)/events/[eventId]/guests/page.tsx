import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getEventGuestList } from '@/data/rsvps'
import { GuestList } from '@/components/guest-list'

export const instant = false

type Props = {
  params: Promise<{ eventId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params
  const data = await getEventGuestList(eventId)
  if (!data) return { title: 'Guest List - HeadCount' }
  return {
    title: `${data.event_title} — Guest List · HeadCount`,
    description: `Check in guests for ${data.event_title}`,
  }
}

async function GuestListContent({ eventId }: { eventId: string }) {
  const data = await getEventGuestList(eventId)

  if (!data) {
    notFound()
  }

  const { event_title, rsvps, totals } = data

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="mb-1">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              My Events
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {event_title}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Guest List
          </p>
        </div>
      </div>

      {/* Totals bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <TotalCard
          label="RSVPs"
          value={totals.rsvp_count}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          }
        />
        <TotalCard
          label="Total Guests"
          value={totals.total_guests}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          }
        />
        <TotalCard
          label="Checked In"
          value={totals.checked_in_guests}
          highlight={totals.checked_in_guests > 0}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          }
        />
        <TotalCard
          label="Spots Left"
          value={totals.spots_left}
          dimWhenZero
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          }
        />
      </div>

      {/* Guest list (interactive — client component) */}
      <GuestList rsvps={rsvps} eventId={eventId} />
    </div>
  )
}

function TotalCard({
  label,
  value,
  icon,
  highlight = false,
  dimWhenZero = false,
}: {
  label: string
  value: number
  icon: React.ReactNode
  highlight?: boolean
  dimWhenZero?: boolean
}) {
  const isZero = value === 0
  return (
    <div
      className={[
        'rounded-xl border p-4 flex flex-col gap-1',
        highlight && value > 0
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
          : dimWhenZero && isZero
            ? 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-60'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900',
      ].join(' ')}
    >
      <svg
        className={[
          'w-4 h-4',
          highlight && value > 0
            ? 'text-emerald-500'
            : 'text-zinc-400 dark:text-zinc-500',
        ].join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {icon}
      </svg>
      <span
        className={[
          'text-2xl font-bold tabular-nums',
          highlight && value > 0
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-zinc-900 dark:text-zinc-100',
        ].join(' ')}
      >
        {value}
      </span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  )
}

export default async function GuestListPage({ params }: Props) {
  const { eventId } = await params

  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-zinc-500">
          Loading guest list…
        </div>
      }
    >
      <GuestListContent eventId={eventId} />
    </Suspense>
  )
}

