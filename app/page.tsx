import { Hero } from "@/components/hero"
import { Generator } from "@/components/generator"
import { Features } from "@/components/features"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default async function Page() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Generator />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
