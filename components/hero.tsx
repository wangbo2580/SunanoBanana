"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

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
            <span className="text-primary">Banana Pro — AI 软装设计解析</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            一分钟生成
            <br />
            专业设计图纸
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed max-w-2xl mx-auto">
            面向软装设计师的 AI 工具。
            上传图片，选择场景，即刻获得渲染增强、彩平图、配色分析等专业输出。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/render">
              <Button size="lg" className="text-lg px-8">
                开始使用
              </Button>
            </Link>
            <Link href="/edit">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                自由修图
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>渲染增强</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>彩平图生成</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>配色分析</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>软装拆解</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
