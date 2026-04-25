"use client"

import { useState, useCallback } from "react"

export type GenerateStatus = "idle" | "loading" | "success" | "error"

interface GenerateResult {
  status: GenerateStatus
  resultImage: string | null
  error: string | null
  remaining: number | null
  iteration: number
}

function getAnonymousId(): string {
  let id = localStorage.getItem("anonymous_id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("anonymous_id", id)
  }
  return id
}

export function useSceneGenerate() {
  const [status, setStatus] = useState<GenerateStatus>("idle")
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [iteration, setIteration] = useState(0)

  const generate = useCallback(async (imageUrl: string, prompt: string) => {
    setStatus("loading")
    setError(null)

    try {
      const anonymousId = getAnonymousId()

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          prompt: prompt.trim(),
          anonymousId,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMsg = text
        try {
          const data = JSON.parse(text)
          errorMsg = data.error || text
        } catch {
          // noop
        }
        throw new Error(errorMsg || "生成失败")
      }

      const data = await response.json()

      if (data.images && data.images.length > 0) {
        setResultImage(data.images[0].image_url.url)
      }
      if (data.remaining !== undefined) {
        setRemaining(data.remaining)
      }
      setIteration((prev) => prev + 1)
      setStatus("success")
    } catch (err: any) {
      setError(err.message || "生成失败，请稍后重试")
      setStatus("error")
    }
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setResultImage(null)
    setError(null)
    setIteration(0)
  }, [])

  return {
    status,
    resultImage,
    error,
    remaining,
    iteration,
    generate,
    reset,
  }
}
