"use client"

import { useTranslations } from "next-intl"
import { Check, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const plans = [
  {
    key: "basic",
    price: 144,
    credits: 1800,
    monthlyImages: 75,
    features: ["credits", "images", "basicModels", "standardSupport", "commercialLicense", "cancelAnytime"],
    comingSoon: [],
  },
  {
    key: "pro",
    price: 234,
    credits: 9600,
    monthlyImages: 400,
    popular: true,
    features: ["credits", "images", "advancedModels", "prioritySupport", "batchGeneration", "commercialLicense", "cancelAnytime"],
    comingSoon: ["imageEditingTools"],
  },
  {
    key: "max",
    price: 480,
    credits: 19200,
    monthlyImages: 800,
    features: ["credits", "images", "fastestSpeed", "dedicatedManager", "priorityQueue", "commercialLicense", "cancelAnytime"],
    comingSoon: ["professionalEditingSuite"],
  },
]

export function Pricing() {
  const t = useTranslations("pricing")

  const handleSubscribe = (planKey: string) => {
    toast.info(t("comingSoonToast"), {
      description: t("comingSoonDesc"),
    })
  }

  return (
    <section id="pricing" className="py-20 bg-muted/30 relative">
      <div className="absolute bottom-10 left-10 text-7xl opacity-5">🍌</div>

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">{t("title")}</h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.key}
                className={`relative p-6 flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105 z-10"
                    : "hover:shadow-lg transition-shadow"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {t("mostPopular")}
                  </Badge>
                )}

                <div className="space-y-4 flex-1">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">{t(`plans.${plan.key}.name`)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t(`plans.${plan.key}.description`)}
                    </p>
                  </div>

                  <div className="text-center py-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{t("year")}</span>
                    </div>
                  </div>

                  <div className="text-center pb-4 border-b">
                    <div className="text-2xl font-semibold text-primary">
                      {plan.credits.toLocaleString()} {t("credits")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ {plan.monthlyImages} {t("monthlyImages")}
                    </div>
                  </div>

                  <ul className="space-y-3 py-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">
                          {feature === "credits"
                            ? `${plan.credits.toLocaleString()} ${t("features.credits")}`
                            : feature === "images"
                            ? `${plan.monthlyImages} ${t("features.images")}`
                            : t(`features.${feature}`)}
                        </span>
                      </li>
                    ))}
                    {plan.comingSoon.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                        <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          {t(`features.${feature}`)}{" "}
                          <span className="text-orange-500">({t("comingSoon")})</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.key)}
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full mt-4"
                  size="lg"
                >
                  {t("getStarted")} {t(`plans.${plan.key}.name`)}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
