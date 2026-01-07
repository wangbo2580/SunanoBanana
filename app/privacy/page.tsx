"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  const t = useTranslations("privacy")

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
              <h2 className="text-2xl font-semibold mb-4">{t("sections.intro.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.intro.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.collection.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.collection.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("sections.collection.items.account")}</li>
                <li>{t("sections.collection.items.usage")}</li>
                <li>{t("sections.collection.items.images")}</li>
                <li>{t("sections.collection.items.device")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.use.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.use.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("sections.use.items.service")}</li>
                <li>{t("sections.use.items.improve")}</li>
                <li>{t("sections.use.items.communicate")}</li>
                <li>{t("sections.use.items.security")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.sharing.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.sharing.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.security.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.security.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.cookies.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("sections.cookies.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sections.rights.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.rights.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("sections.rights.items.access")}</li>
                <li>{t("sections.rights.items.correct")}</li>
                <li>{t("sections.rights.items.delete")}</li>
                <li>{t("sections.rights.items.export")}</li>
              </ul>
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
