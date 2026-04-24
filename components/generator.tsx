"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  ImageIcon,
  Sparkles,
  Loader2,
  Download,
  X,
  AlertCircle,
  Wand2,
  MapPin,
} from "lucide-react"
import { uploadImage } from "@/lib/supabase/upload-client"

async function compositeAnnotatedImage(
  imageUrl: string,
  annotation: { x: number; y: number }
): Promise<Blob> {
  const response = await fetch(imageUrl, { mode: "cors", cache: "reload" })
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }
  const sourceBlob = await response.blob()
  const blobUrl = URL.createObjectURL(sourceBlob)

  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () =>
        reject(new Error("Failed to decode image for compositing"))
      img.src = blobUrl
    })

    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2D context not available")
    ctx.drawImage(img, 0, 0)

    const cx = annotation.x * canvas.width
    const cy = annotation.y * canvas.height
    const radius = Math.max(canvas.width, canvas.height) * 0.035
    const strokeWidth = Math.max(4, canvas.width * 0.005)

    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255, 0, 0, 0.35)"
    ctx.fill()
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = "rgba(235, 0, 0, 1)"
    ctx.stroke()

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Canvas toBlob returned null"))
        },
        "image/png"
      )
    })
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

interface GeneratedImage {
  type: string
  image_url: {
    url: string
  }
}

type ReferenceUsage = "add_object" | "style" | "background"

function getAnonymousId(): string {
  let id = localStorage.getItem("anonymous_id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("anonymous_id", id)
  }
  return id
}

export function Generator() {
  const t = useTranslations("generator")
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(
    null
  )
  const [referenceUsage, setReferenceUsage] =
    useState<ReferenceUsage>("add_object")
  const [prompt, setPrompt] = useState("")
  const [shouldUpscale, setShouldUpscale] = useState(false)
  const [annotation, setAnnotation] = useState<{ x: number; y: number } | null>(
    null
  )
  const [isUploadingMain, setIsUploadingMain] = useState(false)
  const [isUploadingRef, setIsUploadingRef] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [responseText, setResponseText] = useState("")
  const [refinedPrompt, setRefinedPrompt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isLoadingQuota, setIsLoadingQuota] = useState(false)

  useEffect(() => {
    const anonymousId = getAnonymousId()
    setIsLoadingQuota(true)
    fetch(`/api/usage?anonymousId=${anonymousId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.remaining !== undefined) {
          setRemaining(data.remaining)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingQuota(false))
  }, [])

  const isQuotaExceeded = remaining !== null && remaining <= 0

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError(t("fileSizeError"))
      return
    }
    setIsUploadingMain(true)
    setError(null)
    setAnnotation(null)
    try {
      const url = await uploadImage(file, getAnonymousId(), "main")
      setSelectedImageUrl(url)
    } catch (err: any) {
      setError(err.message || "Upload failed")
    } finally {
      setIsUploadingMain(false)
    }
  }

  const handleImageClickToAnnotate = (
    e: React.MouseEvent<HTMLImageElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    if (x < 0 || x > 1 || y < 0 || y > 1) return
    setAnnotation({ x, y })
  }

  const handleReferenceImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError(t("fileSizeError"))
      return
    }
    setIsUploadingRef(true)
    setError(null)
    try {
      const url = await uploadImage(file, getAnonymousId(), "reference")
      setReferenceImageUrl(url)
    } catch (err: any) {
      setError(err.message || "Upload failed")
    } finally {
      setIsUploadingRef(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedImageUrl) {
      setError(t("uploadFirst"))
      return
    }
    if (!prompt.trim()) {
      setError(t("enterPrompt"))
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImages([])
    setResponseText("")
    setRefinedPrompt("")

    try {
      const anonymousId = getAnonymousId()

      let effectiveImageUrl = selectedImageUrl
      if (annotation) {
        const blob = await compositeAnnotatedImage(selectedImageUrl, annotation)
        const file = new File([blob], `annotated-${Date.now()}.png`, {
          type: "image/png",
        })
        effectiveImageUrl = await uploadImage(file, anonymousId, "annotated")
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: effectiveImageUrl,
          referenceImageUrl,
          prompt: prompt.trim(),
          anonymousId,
          referenceUsage: referenceImageUrl ? referenceUsage : undefined,
          hasAnnotation: !!annotation,
          upscale: shouldUpscale,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMsg = text
        try {
          const data = JSON.parse(text)
          errorMsg = data.error || text
        } catch {
          // not json
        }
        throw new Error(errorMsg || "Failed to generate image")
      }

      const data = await response.json()

      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images)
      }
      if (data.text) {
        setResponseText(data.text)
      }
      if (data.refinedPrompt) {
        setRefinedPrompt(data.refinedPrompt)
      }

      if (data.remaining !== undefined) {
        setRemaining(data.remaining)
      }

      if ((!data.images || data.images.length === 0) && !data.text) {
        setError(t("noImageGenerated"))
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the image")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `nano-banana-${Date.now()}-${index}.png`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleContinueEditing = (imgUrl: string) => {
    setSelectedImageUrl(imgUrl)
    setReferenceImageUrl(null)
    setPrompt("")
    setAnnotation(null)
    setGeneratedImages([])
    setResponseText("")
    setRefinedPrompt("")
    setError(null)
    document
      .getElementById("generator")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  const clearImage = () => {
    setSelectedImageUrl(null)
    setReferenceImageUrl(null)
    setAnnotation(null)
    setGeneratedImages([])
    setResponseText("")
    setRefinedPrompt("")
    setError(null)
  }

  const clearReferenceImage = () => {
    setReferenceImageUrl(null)
    setError(null)
  }

  return (
    <section id="generator" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">
              {t("title")}
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              {t("description")}
            </p>
          </div>

          <Card className="p-8 md:p-12">
            {isQuotaExceeded && (
              <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive">
                      {t("quotaExceeded")}
                    </h3>
                    <p className="text-sm text-destructive/80 mt-1">
                      {t("quotaExceededDesc")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {remaining !== null && !isQuotaExceeded && (
              <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t("remainingQuota")}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {remaining} / 50
                  </span>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-12">
              {/* Upload Section */}
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    {t("referenceImage")}
                  </Label>
                  {isUploadingMain ? (
                    <div className="relative border-2 border-dashed rounded-lg p-12 text-center bg-muted/30">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {t("uploading")}
                        </p>
                      </div>
                    </div>
                  ) : selectedImageUrl ? (
                    <div className="space-y-2">
                      <div className="relative border-2 rounded-lg p-4 bg-muted/30">
                        <div className="relative inline-block mx-auto w-full">
                          <img
                            src={selectedImageUrl}
                            alt="Uploaded"
                            onClick={handleImageClickToAnnotate}
                            className="max-w-full max-h-72 mx-auto object-contain rounded cursor-crosshair block"
                          />
                          {annotation && (
                            <div
                              className="absolute rounded-full bg-red-500/35 border-[3px] border-red-600 pointer-events-none shadow-lg"
                              style={{
                                left: `${annotation.x * 100}%`,
                                top: `${annotation.y * 100}%`,
                                width: "36px",
                                height: "36px",
                                transform: "translate(-50%, -50%)",
                              }}
                            />
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={clearImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground flex-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {annotation ? t("annotateMarked") : t("annotateHint")}
                        </p>
                        {annotation && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setAnnotation(null)}
                          >
                            {t("annotateClear")}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("uploadImage")}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("maxSize")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* 参考图（可选） */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    {t("styleReferenceImage")}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("styleReferenceDesc")}
                  </p>
                  <div
                    className="relative border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
                    onClick={() =>
                      !isUploadingRef &&
                      document.getElementById("reference-image-upload")?.click()
                    }
                  >
                    {isUploadingRef ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {t("uploading")}
                        </p>
                      </div>
                    ) : referenceImageUrl ? (
                      <>
                        <img
                          src={referenceImageUrl}
                          alt="Reference"
                          className="max-w-full h-32 mx-auto object-contain rounded"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearReferenceImage()
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {t("uploadStyleReference")}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("maxSize")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="reference-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReferenceImageUpload}
                  />

                  {referenceImageUrl && (
                    <div className="mt-3">
                      <Label className="text-sm font-medium mb-2 block">
                        {t("referenceUsageLabel")}
                      </Label>
                      <Select
                        value={referenceUsage}
                        onValueChange={(v) =>
                          setReferenceUsage(v as ReferenceUsage)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add_object">
                            {t("referenceUsageAddObject")}
                          </SelectItem>
                          <SelectItem value="style">
                            {t("referenceUsageStyle")}
                          </SelectItem>
                          <SelectItem value="background">
                            {t("referenceUsageBackground")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="prompt"
                    className="text-lg font-semibold mb-4 block"
                  >
                    {t("mainPrompt")}
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder={t("placeholder")}
                    className="min-h-32 resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    isUploadingMain ||
                    isUploadingRef ||
                    !selectedImageUrl ||
                    !prompt.trim() ||
                    isQuotaExceeded
                  }
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("generateNow")}
                    </>
                  )}
                </Button>
              </div>

              {/* Output Section */}
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    {t("outputGallery")}
                  </Label>
                  <div className="border-2 rounded-lg p-6 bg-muted/30 min-h-[300px]">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-lg font-medium">
                          {t("generatingImage")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t("mayTakeMoments")}
                        </p>
                      </div>
                    ) : generatedImages.length > 0 || responseText ? (
                      <div className="space-y-4">
                        {generatedImages.map((img, index) => (
                          <div key={index} className="space-y-2">
                            <div className="relative group">
                              <img
                                src={img.image_url.url}
                                alt={`Generated ${index + 1}`}
                                className="w-full rounded-lg shadow-lg"
                              />
                              <Button
                                size="sm"
                                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  handleDownload(img.image_url.url, index)
                                }
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {t("download")}
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() =>
                                handleContinueEditing(img.image_url.url)
                              }
                            >
                              <Wand2 className="w-4 h-4 mr-2" />
                              {t("continueEditing")}
                            </Button>
                          </div>
                        ))}
                        {refinedPrompt && (
                          <details className="p-3 bg-background rounded-lg border text-xs">
                            <summary className="cursor-pointer font-medium">
                              {t("refinedPromptLabel")}
                            </summary>
                            <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                              {refinedPrompt}
                            </p>
                          </details>
                        )}
                        {responseText && (
                          <div className="p-4 bg-background rounded-lg border">
                            <p className="text-sm text-muted-foreground">
                              {responseText}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
                        <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">
                          {t("creationsAppear")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t("readyForGeneration")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-sm font-medium">{t("moreFeatures")}</p>
                  <Button variant="link" className="text-primary">
                    {t("visitGenerator")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
