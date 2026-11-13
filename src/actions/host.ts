'use server'

import { requireHostUser, verifyHostActionAuth } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

/**
 * Server-side authentication guard for host-only server actions.
 * Directly verifies the current user on the server.
 * Redirects signed-out callers to the /login route.
 */
export async function requireHostAction(): Promise<User> {
  return await requireHostUser()
}

/**
 * Non-redirecting server-side authentication check for host-only server actions.
 * Returns { user } if authenticated, or { error } if signed out.
 */
export async function verifyHostAction(): Promise<
  { user: User; error?: never } | { user?: never; error: string }
> {
  return await verifyHostActionAuth()
}

