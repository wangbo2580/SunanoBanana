'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

function getBaseUrl() {
  // 优先使用环境变量配置的站点 URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  // 生产环境使用 Vercel 自动提供的 URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // 本地开发环境
  return 'http://localhost:3000'
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured')
    redirect('/auth/auth-code-error')
  }

  const supabase = await createClient()
  if (!supabase) {
    redirect('/auth/auth-code-error')
  }

  const baseUrl = getBaseUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
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
