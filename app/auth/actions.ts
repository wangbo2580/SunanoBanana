'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured')
    redirect('/auth/auth-code-error')
  }

  const supabase = await createClient()
  if (!supabase) {
    redirect('/auth/auth-code-error')
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('OAuth error:', error)
    redirect('/auth/auth-code-error')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect('/')
  }

  const supabase = await createClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect('/')
}
