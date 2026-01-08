"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RefundPage() {
  const t = useTranslations("refund")

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Button>
          </Link>

          <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
          <p className="text-muted-foreground mb-8">{t("lastUpdated")}: 2025-01-08</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.overview.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.overview.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.eligibility.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.eligibility.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("sections.eligibility.items.unused")}</li>
                <li>{t("sections.eligibility.items.technical")}</li>
                <li>{t("sections.eligibility.items.duplicate")}</li>
                <li>{t("sections.eligibility.items.unauthorized")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.nonRefundable.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.nonRefundable.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("sections.nonRefundable.items.used")}</li>
                <li>{t("sections.nonRefundable.items.violation")}</li>
                <li>{t("sections.nonRefundable.items.expired")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.process.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.process.content")}</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li>{t("sections.process.items.contact")}</li>
                <li>{t("sections.process.items.provide")}</li>
                <li>{t("sections.process.items.review")}</li>
                <li>{t("sections.process.items.notification")}</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.timeline.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.timeline.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.partialRefunds.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.partialRefunds.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.cancellation.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.cancellation.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.contact.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("sections.contact.content")}{" "}
                <a
                  href="mailto:support@sumunanobanana.store"
                  className="text-primary hover:underline"
                >
                  support@sumunanobanana.store
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
