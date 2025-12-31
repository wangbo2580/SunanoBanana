"use client"

import { useTranslations } from "next-intl"
import { Sparkles, Users, Layers, Zap, Images, Palette } from "lucide-react"
import { Card } from "@/components/ui/card"

const featureKeys = [
  { key: "naturalLanguage", icon: Sparkles },
  { key: "characterConsistency", icon: Users },
  { key: "scenePreservation", icon: Layers },
  { key: "oneShot", icon: Zap },
  { key: "multiImage", icon: Images },
  { key: "aiUgc", icon: Palette },
]

export function Features() {
  const t = useTranslations("features")

  return (
    <section className="py-20 bg-background relative">
      {/* Decorative banana */}
      <div className="absolute top-10 right-10 text-7xl opacity-5">🍌</div>

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">{t("title")}</h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureKeys.map((feature) => (
              <Card key={feature.key} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{t(`${feature.key}.title`)}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t(`${feature.key}.description`)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
