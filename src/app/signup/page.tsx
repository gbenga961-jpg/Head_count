import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Sign Up - HeadCount',
  description: 'Create a HeadCount host account to collect RSVPs',
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50 dark:bg-black">
      <AuthForm initialMode="signup" />
    </main>
  )
}

