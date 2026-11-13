import Link from 'next/link'
import { requireHostUser } from '@/lib/auth'
import { signOut } from '@/actions/auth'

export const instant = false

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireHostUser()

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/events"
            className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            HeadCount
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <button
                type="submit"
                className="text-sm font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
