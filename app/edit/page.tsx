"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Generator } from "@/components/generator"

export default function EditPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回首页
        </Link>
      </div>
      <Generator />
    </div>
  )
}
