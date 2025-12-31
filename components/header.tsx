import { cookies } from "next/headers"
import { LanguageSwitcher } from "./language-switcher"
import { AuthButton } from "./auth-button"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"

export async function Header() {
  const cookieStore = await cookies()
  const locale = cookieStore.get("locale")?.value || "en"

  let user = null
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    if (supabase) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span>🍌</span>
            <span>SuMu Nano Banana</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            {isSupabaseConfigured() && <AuthButton user={user} />}
          </div>
        </div>
      </div>
    </header>
  )
}
