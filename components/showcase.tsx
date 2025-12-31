import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const showcaseItems = [
  {
    title: "Ultra-Fast Mountain Generation",
    description: "Created in 0.8 seconds with Nano Banana's optimized neural engine",
    image: "/mountain-landscape.png",
  },
  {
    title: "Instant Garden Creation",
    description: "Complex scene rendered in milliseconds using Nano Banana technology",
    image: "/beautiful-garden-with-colorful-flowers.jpg",
  },
  {
    title: "Real-time Beach Synthesis",
    description: "Nano Banana delivers photorealistic results at lightning speed",
    image: "/tropical-sunset-palms.png",
  },
  {
    title: "Rapid Aurora Generation",
    description: "Advanced effects processed instantly with Nano Banana AI",
    image: "/images/northern-lights.png",
  },
]

export function Showcase() {
  return (
    <section id="showcase" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Decorative bananas */}
      <div className="absolute top-20 left-5 text-6xl opacity-5 rotate-12">🍌</div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-5 -rotate-12">🍌</div>

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">Showcase</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Lightning-Fast AI Creations - See what Nano Banana generates in milliseconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {showcaseItems.map((item) => (
              <Card key={item.title} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-64 object-cover" />
                  <Badge className="absolute top-4 left-4 bg-primary">
                    <span className="mr-1">⚡</span>
                    Nano Banana Speed
                  </Badge>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-lg mb-6">Experience the power of Nano Banana yourself</p>
            <Button size="lg">
              <span className="mr-2">🍌</span>
              Try Nano Banana Generator
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
