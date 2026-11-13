import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * Retrieves the authenticated user on the server via Supabase Auth.
 * Uses React cache() to deduplicate auth requests during a single render pass.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
})

/**
 * Server-side authentication check for the host route group and host server actions.
 * Directly verifies the current user on the server.
 * Redirects signed-out visitors to the /login route.
 */
export async function requireHostUser(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Server-side authentication verification for host-only server actions.
 * Returns the authenticated user or an error response if signed out.
 */
export async function verifyHostActionAuth(): Promise<
  { user: User; error?: never } | { user?: never; error: string }
> {
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Unauthorized: Please log in to perform this action.' }
  }

  return { user }
}

