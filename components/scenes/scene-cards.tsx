"use client"

import Link from "next/link"
import { Palette, Grid3x3, Pipette, LayoutGrid, Wand2, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SCENES } from "@/lib/prompt-templates"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Grid3x3,
  Pipette,
  LayoutGrid,
  Wand2,
}

export function SceneCards() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">选择设计场景</h2>
            <p className="text-muted-foreground text-lg">
              上传图片，选择场景，AI 一分钟生成专业设计图纸
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCENES.map((scene) => {
              const Icon = ICON_MAP[scene.icon]
              return (
                <Link key={scene.id} href={`/${scene.id}`} className="group">
                  <Card className="p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${scene.color}15` }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: scene.color }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {scene.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {scene.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      开始使用
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
