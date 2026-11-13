'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { logIn, signUp, type AuthResult } from '@/actions/auth'

interface AuthFormProps {
  initialMode?: 'login' | 'signup'
}

export function AuthForm({ initialMode = 'login' }: AuthFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isLogin = mode === 'login'

  function switchMode(newMode: 'login' | 'signup') {
    setMode(newMode)
    setError(null)
    setSuccessMessage(null)
  }

  function validate(): boolean {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email is required.')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return false
    }
    if (!password) {
      setError('Password is required.')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!validate()) {
      return
    }

    startTransition(async () => {
      try {
        let result: AuthResult

        if (isLogin) {
          result = await logIn({ email: email.trim(), password })
        } else {
          result = await signUp({ email: email.trim(), password })
        }

        if (!result.success) {
          setError(result.error ?? 'Authentication failed. Please try again.')
          return
        }

        if (result.requiresEmailConfirmation) {
          setSuccessMessage(
            result.message ??
              'Please check your email to confirm your account before logging in.'
          )
          return
        }

        setSuccessMessage(
          isLogin
            ? 'Logged in successfully. Redirecting...'
            : 'Account created successfully. Redirecting...'
        )

        // Session established, navigate to events
        router.push('/events')
        router.refresh()
      } catch {
        setError('An unexpected error occurred. Please try again.')
      }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          HeadCount
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {isLogin
            ? 'Log in to manage your events and guest lists'
            : 'Sign up to start organizing events and collecting RSVPs'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        role="tablist"
        className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 mb-6 text-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          onClick={() => switchMode('login')}
          className={`flex-1 min-h-[40px] rounded-md font-medium transition-all ${
            isLogin
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          onClick={() => switchMode('signup')}
          className={`flex-1 min-h-[40px] rounded-md font-medium transition-all ${
            !isLogin
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div
          role="status"
          className="mb-5 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-200"
        >
          {successMessage}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="auth-email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            disabled={isPending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            name="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            disabled={isPending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {!isLogin && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Must be at least 6 characters long.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 mt-2 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
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
              <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
            </span>
          ) : (
            <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
          )}
        </button>
      </form>

      {/* Bottom Switch Link */}
      <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {isLogin ? (
          <p>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              disabled={isPending}
              className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:opacity-80"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('login')}
              disabled={isPending}
              className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:opacity-80"
            >
              Log in
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

