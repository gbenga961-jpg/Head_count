'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type AuthResult = {
  success: boolean
  error?: string
  message?: string
  requiresEmailConfirmation?: boolean
}

export type CredentialsInput =
  | FormData
  | {
      email?: string
      password?: string
    }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseCredentials(input: CredentialsInput): {
  email: string
  password: string
} {
  if (input instanceof FormData) {
    const email = (input.get('email') as string | null) ?? ''
    const password = (input.get('password') as string | null) ?? ''
    return { email: email.trim(), password }
  }

  return {
    email: (input?.email ?? '').trim(),
    password: input?.password ?? '',
  }
}

function validateCredentials(email: string, password: string): string | null {
  if (!email) {
    return 'Email is required.'
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address.'
  }
  if (!password) {
    return 'Password is required.'
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.'
  }
  return null
}

/**
 * Server action for host sign-up.
 * Respects Supabase email confirmation settings and sanitizes error responses.
 */
export async function signUp(input: CredentialsInput): Promise<AuthResult> {
  const { email, password } = parseCredentials(input)

  const validationError = validateCredentials(email, password)
  if (validationError) {
    return { success: false, error: validationError }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    // Return a safe message without leaking private account status
    return {
      success: false,
      error: 'Unable to create account. Please check your details and try again.',
    }
  }

  // If email confirmation is enabled on the Supabase project,
  // user exists but session is null until confirmed.
  if (data.user && !data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      message: 'Please check your email to confirm your account before logging in.',
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    requiresEmailConfirmation: false,
    message: 'Account created successfully.',
  }
}

/**
 * Server action for host login.
 * Sanitizes errors to prevent account enumeration.
 */
export async function logIn(input: CredentialsInput): Promise<AuthResult> {
  const { email, password } = parseCredentials(input)

  const validationError = validateCredentials(email, password)
  if (validationError) {
    return { success: false, error: validationError }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Return sanitized message avoiding disclosure of whether email exists
    return {
      success: false,
      error: 'Invalid email or password.',
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Logged in successfully.',
  }
}

/**
 * Server action for host sign-out.
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      success: false,
      error: 'Failed to sign out. Please try again.',
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Signed out successfully.',
  }
}

// Export common aliases
export const signIn = logIn
export const logOut = signOut

