import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Log In - HeadCount',
  description: 'Log in to your HeadCount host account',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50 dark:bg-black">
      <AuthForm initialMode="login" />
    </main>
  )
}

