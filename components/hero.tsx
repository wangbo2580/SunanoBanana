import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Banana decorative elements */}
      <div className="absolute top-20 left-10 text-6xl opacity-10 rotate-12">🍌</div>
      <div className="absolute bottom-40 right-20 text-8xl opacity-5 -rotate-45">🍌</div>
      <div className="absolute top-1/3 right-1/4 text-4xl opacity-10 rotate-90">🍌</div>

      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
            <span className="text-2xl">🍌</span>
            <span className="text-primary">The AI model that outperforms Flux Kontext</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">SuMu Nano Banana</h1>

          <p className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed">
            Transform any image with simple text prompts. Nano-banana's advanced model delivers consistent character
            editing and scene preservation that surpasses Flux Kontext.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" className="text-lg px-8">
              Start Editing
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              View Examples
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>One-shot editing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Multi-image support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Natural language</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
