"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Mail } from "lucide-react"

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>🍌</span>
              <span>SuMu Nano Banana</span>
            </div>

            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>{t("copyright")}</p>
              <p className="mt-1">{t("tagline")}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground">{t("independent")}</p>
              <a
                href="mailto:support@sumunanobanana.store"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@sumunanobanana.store
              </a>
            </div>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("terms")}
              </Link>
              <Link
                href="/refund"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("refund")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
