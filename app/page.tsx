import { Hero } from "@/components/hero"
import { Generator } from "@/components/generator"
import { Features } from "@/components/features"
import { Showcase } from "@/components/showcase"
import { Reviews } from "@/components/reviews"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"

export default async function Page() {
  let user = null
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    if (supabase) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }
  }

  return (
    <main className="min-h-screen">
      <Hero />
      <Generator user={user} />
      <Features />
      <Showcase />
      <Reviews />
      <FAQ />
      <Footer />
    </main>
  )
}
