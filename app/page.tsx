import { Hero } from "@/components/hero"
import { SceneCards } from "@/components/scenes/scene-cards"
import { Footer } from "@/components/footer"

export default async function Page() {
  return (
    <main className="min-h-screen">
      <Hero />
      <SceneCards />
      <HowItWorks />
      <Footer />
    </main>
  )
}

function HowItWorks() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">三步生成专业图纸</h2>
            <p className="text-muted-foreground">简单高效，无需复杂操作</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="上传图片"
              description="上传你的 SU 截图、平面图或室内照片"
            />
            <StepCard
              number="2"
              title="选择场景"
              description="从多种设计场景中选择适合的工具"
            />
            <StepCard
              number="3"
              title="AI 生成"
              description="一分钟内获得专业级设计效果图"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
