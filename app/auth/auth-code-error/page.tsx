"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">🍌</div>
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground max-w-md">
          There was a problem signing you in. Please try again.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
