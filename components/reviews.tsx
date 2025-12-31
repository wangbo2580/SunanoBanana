"use client"

import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const reviewKeys = [
  { key: "artist", avatar: "AA" },
  { key: "creator", avatar: "CC" },
  { key: "editor", avatar: "PE" },
]

export function Reviews() {
  const t = useTranslations("reviews")

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">{t("title")}</h2>
            <p className="text-lg text-muted-foreground text-balance">{t("description")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviewKeys.map((review) => (
              <Card key={review.key} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed">"{t(`items.${review.key}.content`)}"</p>

                <div className="flex items-center gap-3 pt-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {review.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{t(`items.${review.key}.name`)}</p>
                    <p className="text-sm text-muted-foreground">{t(`items.${review.key}.role`)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
