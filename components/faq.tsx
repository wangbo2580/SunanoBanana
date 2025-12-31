"use client"

import { useTranslations } from "next-intl"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqKeys = ["what", "how", "better", "commercial", "types"]

export function FAQ() {
  const t = useTranslations("faq")

  return (
    <section className="py-20 bg-muted/30 relative">
      {/* Decorative banana */}
      <div className="absolute bottom-10 left-10 text-8xl opacity-5 rotate-45">🍌</div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">{t("title")}</h2>
            <p className="text-lg text-muted-foreground text-balance">{t("description")}</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqKeys.map((key, index) => (
              <AccordionItem key={key} value={`item-${index}`} className="bg-background border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-lg">{t(`items.${key}.question`)}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {t(`items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
