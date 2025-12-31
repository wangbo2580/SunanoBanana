"use client"

import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const showcaseKeys = [
  { key: "mountain", image: "/mountain-landscape.png" },
  { key: "garden", image: "/beautiful-garden-with-colorful-flowers.jpg" },
  { key: "beach", image: "/tropical-sunset-palms.png" },
  { key: "aurora", image: "/images/northern-lights.png" },
]

export function Showcase() {
  const t = useTranslations("showcase")

  return (
    <section id="showcase" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Decorative bananas */}
      <div className="absolute top-20 left-5 text-6xl opacity-5 rotate-12">🍌</div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-5 -rotate-12">🍌</div>

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">{t("title")}</h2>
            <p className="text-lg text-muted-foreground text-balance">
              {t("description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {showcaseKeys.map((item) => (
              <Card key={item.key} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img src={item.image || "/placeholder.svg"} alt={t(`items.${item.key}.title`)} className="w-full h-64 object-cover" />
                  <Badge className="absolute top-4 left-4 bg-primary">
                    <span className="mr-1">⚡</span>
                    {t("speed")}
                  </Badge>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-semibold">{t(`items.${item.key}.title`)}</h3>
                  <p className="text-muted-foreground">{t(`items.${item.key}.description`)}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-lg mb-6">{t("experience")}</p>
            <Button size="lg">
              <span className="mr-2">🍌</span>
              {t("tryGenerator")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
