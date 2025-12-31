"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export function Hero() {
  const t = useTranslations("hero")

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
            <span className="text-primary">{t("badge")}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">SuMu Nano Banana</h1>

          <p className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed">
            {t("description")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" className="text-lg px-8">
              {t("startEditing")}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              {t("viewExamples")}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>{t("oneShot")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>{t("multiImage")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>{t("naturalLanguage")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
