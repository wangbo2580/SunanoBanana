import { cookies } from "next/headers"
import { LanguageSwitcher } from "./language-switcher"

export async function Header() {
  const cookieStore = await cookies()
  const locale = cookieStore.get("locale")?.value || "en"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span>🍌</span>
            <span>SuMu Nano Banana</span>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  )
}
