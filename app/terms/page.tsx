"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  const t = useTranslations("terms")

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
          <p className="text-muted-foreground mb-8">{t("lastUpdated")}: 2025-01-07</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.acceptance.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.acceptance.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.description.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.description.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.account.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.account.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("sections.account.items.accurate")}</li>
                <li>{t("sections.account.items.secure")}</li>
                <li>{t("sections.account.items.responsible")}</li>
                <li>{t("sections.account.items.notify")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.usage.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.usage.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("sections.usage.items.legal")}</li>
                <li>{t("sections.usage.items.noHarm")}</li>
                <li>{t("sections.usage.items.noInfringe")}</li>
                <li>{t("sections.usage.items.noMalware")}</li>
                <li>{t("sections.usage.items.noAbuse")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.content.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.content.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("sections.content.items.own")}</li>
                <li>{t("sections.content.items.rights")}</li>
                <li>{t("sections.content.items.noIllegal")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.ip.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.ip.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.disclaimer.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.disclaimer.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.limitation.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.limitation.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.termination.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.termination.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.changes.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.changes.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.contact.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.contact.content")}</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
