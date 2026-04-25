"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
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
  Eraser,
  Plus,
  RefreshCw,
  Palette,
  Lightbulb,
  Pencil,
  RotateCcw,
  Info,
} from "lucide-react"
import { uploadImage } from "@/lib/supabase/upload-client"
import {
  ReferenceComposer,
  flattenComposite,
  type LayerTransform,
} from "@/components/reference-composer"
import { MaskPainter, type MaskPainterHandle } from "@/components/mask-painter"

/* ================================================================
   Types
   ================================================================ */
type EditMode = "remove" | "add" | "replace" | "material" | "lighting" | "free"
type ReferenceUsage = "add_object" | "style" | "background"

type ColorTemp = "warm" | "neutral" | "cool"
type BrightnessLevel = "brighter" | "darker" | "current"
type AtmosphereType = "morning" | "sunset" | "night" | "overcast" | "bright"

interface GeneratedImage {
  type: string
  image_url: { url: string }
}

interface ModeConfig {
  id: EditMode
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  requiresMask: boolean
  showReferenceUpload: boolean
  referenceRequired: boolean
  allowsComposer: boolean
  allowsAnnotation: boolean
  usesInpaint: boolean
  colorClass: string
  activeClass: string
  bgClass: string
}

interface LightingConfig {
  colorTemp: ColorTemp
  brightness: BrightnessLevel
  atmosphere: AtmosphereType
}

/* ================================================================
   Helpers
   ================================================================ */
async function compositeAnnotatedImage(
  imageUrl: string,
  annotation: { x: number; y: number }
): Promise<Blob> {
  const response = await fetch(imageUrl, { mode: "cors", cache: "reload" })
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)
  const sourceBlob = await response.blob()
  const blobUrl = URL.createObjectURL(sourceBlob)

  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Failed to decode image"))
      img.src = blobUrl
    })

    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0)

    const cx = annotation.x * canvas.width
    const cy = annotation.y * canvas.height
    const maxDim = Math.max(canvas.width, canvas.height)
    const outerRadius = maxDim * 0.05
    const innerFillRadius = outerRadius * 0.72
    const strokeWidth = Math.max(6, maxDim * 0.0065)
    const crossLen = outerRadius * 1.55

    ctx.beginPath()
    ctx.arc(cx, cy, innerFillRadius, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255, 0, 0, 0.22)"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = "rgba(220, 0, 0, 1)"
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(cx - crossLen, cy)
    ctx.lineTo(cx + crossLen, cy)
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = "rgba(220, 0, 0, 1)"
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(cx, cy - crossLen)
    ctx.lineTo(cx, cy + crossLen)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, strokeWidth, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(220, 0, 0, 1)"
    ctx.fill()

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob returned null"))
      }, "image/png")
    })
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

function getAnonymousId(): string {
  let id = localStorage.getItem("anonymous_id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("anonymous_id", id)
  }
  return id
}

function buildLightingPrompt(config: LightingConfig): string {
  const tempMap: Record<ColorTemp, string> = {
    warm: "warm lighting (2700K-3000K, cozy amber glow)",
    neutral: "neutral lighting (4000K, balanced daylight)",
    cool: "cool lighting (5000K-6500K, crisp bluish-white)",
  }
  const brightMap: Record<BrightnessLevel, string> = {
    brighter: "increase overall brightness and exposure for a vibrant look",
    darker: "decrease brightness for a moody, intimate atmosphere",
    current: "maintain the current brightness level while adjusting other lighting qualities",
  }
  const atmoMap: Record<AtmosphereType, string> = {
    morning: "soft morning sunlight streaming through windows with gentle directional shadows",
    sunset: "golden hour sunset glow with warm orange-pink tones and long soft shadows",
    night: "nighttime ambient lighting with subtle accent and task lights, darker overall",
    overcast: "soft diffused overcast daylight with minimal shadows and even illumination",
    bright: "bright and airy natural daylight filling the entire space evenly",
  }

  return `Adjust the lighting of the interior scene. Use ${tempMap[config.colorTemp]}. ${brightMap[config.brightness]}. Create ${atmoMap[config.atmosphere]}. Keep all furniture, decorations, materials, colors, and spatial layout completely unchanged. Only modify lighting conditions, shadows, reflections, and overall atmosphere. Maintain photorealistic interior rendering quality.`
}

function buildMaterialPrompt(description: string, referenceUrl: string | null): string {
  let prompt = `Change the material and surface finish of the selected area to ${description || "a new material"}. Keep the geometry, structure, proportions, and spatial layout exactly the same. Maintain consistent lighting direction, shadows, and reflections. Do not add or remove any objects. Ensure the new material blends naturally with the surrounding surfaces.`
  if (referenceUrl) {
    prompt += ` Match the material appearance and texture of the reference image.`
  }
  return prompt
}

function buildReplacePrompt(
  useReference: boolean,
  description: string,
  referenceUrl: string | null
): string {
  const target =
    useReference && referenceUrl
      ? "the reference object"
      : description || "a new object"
  return `Replace the object in the painted area with ${target}. Maintain consistent lighting quality, material finish, shadows, and perspective. Seamlessly blend the replacement with the surrounding scene. Do not alter any other elements in the image.`
}

function buildRemovePrompt(): string {
  return `Remove the object in the painted area seamlessly. Fill the removed area with content that matches the surrounding interior scene (walls, flooring, ceiling, background). Do not add any new items, furniture, decorations, plants, or objects. Keep lighting, perspective, and architectural style consistent.`
}

function buildAddPrompt(): string {
  return `Add the reference object into the interior scene at the indicated position. Ensure the added object matches the scene's lighting direction, shadow quality, perspective, scale, and material finish. The object should look naturally integrated and photorealistic, as if it was originally in the scene.`
}

function getDefaultPrompt(
  mode: EditMode,
  cfg: {
    lightingConfig: LightingConfig
    materialDesc: string
    replaceUseRef: boolean
    replaceDesc: string
    referenceImageUrl: string | null
  }
): string {
  switch (mode) {
    case "remove":
      return buildRemovePrompt()
    case "add":
      return buildAddPrompt()
    case "replace":
      return buildReplacePrompt(cfg.replaceUseRef, cfg.replaceDesc, cfg.referenceImageUrl)
    case "material":
      return buildMaterialPrompt(cfg.materialDesc, cfg.referenceImageUrl)
    case "lighting":
      return buildLightingPrompt(cfg.lightingConfig)
    case "free":
      return ""
  }
}

/* ================================================================
   Mode Configuration
   ================================================================ */
const MODES: ModeConfig[] = [
  {
    id: "remove",
    title: "消除物品",
    description: "涂抹想要移除的区域，AI 自动填补",
    icon: Eraser,
    requiresMask: true,
    showReferenceUpload: false,
    referenceRequired: false,
    allowsComposer: false,
    allowsAnnotation: false,
    usesInpaint: true,
    colorClass: "text-red-600",
    activeClass: "bg-red-600 text-white border-red-600",
    bgClass: "bg-red-50 border-red-100",
  },
  {
    id: "add",
    title: "增加物品",
    description: "上传参考物品，拖拽定位后融入",
    icon: Plus,
    requiresMask: false,
    showReferenceUpload: true,
    referenceRequired: true,
    allowsComposer: true,
    allowsAnnotation: false,
    usesInpaint: false,
    colorClass: "text-emerald-600",
    activeClass: "bg-emerald-600 text-white border-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-100",
  },
  {
    id: "replace",
    title: "替换物品",
    description: "涂抹旧物品，指定新物品替换",
    icon: RefreshCw,
    requiresMask: true,
    showReferenceUpload: true,
    referenceRequired: false,
    allowsComposer: false,
    allowsAnnotation: false,
    usesInpaint: true,
    colorClass: "text-blue-600",
    activeClass: "bg-blue-600 text-white border-blue-600",
    bgClass: "bg-blue-50 border-blue-100",
  },
  {
    id: "material",
    title: "更换材质",
    description: "涂抹区域，更换为新的材质",
    icon: Palette,
    requiresMask: true,
    showReferenceUpload: true,
    referenceRequired: false,
    allowsComposer: false,
    allowsAnnotation: false,
    usesInpaint: true,
    colorClass: "text-amber-600",
    activeClass: "bg-amber-600 text-white border-amber-600",
    bgClass: "bg-amber-50 border-amber-100",
  },
  {
    id: "lighting",
    title: "调整灯光",
    description: "改变色温亮度氛围，不改物品",
    icon: Lightbulb,
    requiresMask: false,
    showReferenceUpload: false,
    referenceRequired: false,
    allowsComposer: false,
    allowsAnnotation: false,
    usesInpaint: false,
    colorClass: "text-yellow-600",
    activeClass: "bg-yellow-600 text-white border-yellow-600",
    bgClass: "bg-yellow-50 border-yellow-100",
  },
  {
    id: "free",
    title: "自由编辑",
    description: "完全自定义全部编辑能力",
    icon: Pencil,
    requiresMask: false,
    showReferenceUpload: true,
    referenceRequired: false,
    allowsComposer: true,
    allowsAnnotation: true,
    usesInpaint: false,
    colorClass: "text-slate-600",
    activeClass: "bg-slate-600 text-white border-slate-600",
    bgClass: "bg-slate-50 border-slate-100",
  },
]

/* ================================================================
   SegmentedControl Component
   ================================================================ */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div className="flex p-1 bg-muted rounded-lg gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={cn(
            "flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ================================================================
   Generator Component
   ================================================================ */
export function Generator() {
  const t = useTranslations("generator")

  /* ---- Core state ---- */
  const [mode, setMode] = useState<EditMode>("remove")
  const [prompt, setPrompt] = useState("")
  const [isPromptLocked, setIsPromptLocked] = useState(false)

  /* ---- Image state ---- */
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
  const [referenceUsage, setReferenceUsage] = useState<ReferenceUsage>("add_object")
  const [annotation, setAnnotation] = useState<{ x: number; y: number } | null>(null)
  const [layer, setLayer] = useState<LayerTransform>({
    xPct: 0.5,
    yPct: 0.5,
    widthPct: 0.25,
  })
  const [useComposerPlacement, setUseComposerPlacement] = useState(true)
  const [isInpaintMode, setIsInpaintMode] = useState(false)
  const maskPainterRef = useRef<MaskPainterHandle>(null)

  /* ---- Mode-specific config state ---- */
  const [materialDesc, setMaterialDesc] = useState("")
  const [replaceUseRef, setReplaceUseRef] = useState(true)
  const [replaceDesc, setReplaceDesc] = useState("")
  const [lightingConfig, setLightingConfig] = useState<LightingConfig>({
    colorTemp: "neutral",
    brightness: "current",
    atmosphere: "bright",
  })

  /* ---- Generation state ---- */
  const [isUploadingMain, setIsUploadingMain] = useState(false)
  const [isUploadingRef, setIsUploadingRef] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [responseText, setResponseText] = useState("")
  const [refinedPrompt, setRefinedPrompt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [shouldUpscale, setShouldUpscale] = useState(false)

  /* ---- Quota ---- */
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isLoadingQuota, setIsLoadingQuota] = useState(false)

  /* ---- Derived values ---- */
  const currentMode = MODES.find((m) => m.id === mode)!
  const composerEligible =
    !!selectedImageUrl &&
    !!referenceImageUrl &&
    (mode === "free" ? referenceUsage === "add_object" : currentMode.allowsComposer)
  const showComposer =
    mode === "free"
      ? composerEligible && useComposerPlacement
      : currentMode.allowsComposer && !!referenceImageUrl
  const showMask =
    mode === "free" ? isInpaintMode : currentMode.requiresMask
  const canAnnotate = mode === "free" ? true : currentMode.allowsAnnotation
  const isQuotaExceeded = remaining !== null && remaining <= 0

  /* ---- Effects ---- */
  useEffect(() => {
    const anonymousId = getAnonymousId()
    setIsLoadingQuota(true)
    fetch(`/api/usage?anonymousId=${anonymousId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.remaining !== undefined) setRemaining(data.remaining)
      })
      .catch(console.error)
      .finally(() => setIsLoadingQuota(false))
  }, [])

  useEffect(() => {
    if (referenceImageUrl) {
      setLayer({ xPct: 0.5, yPct: 0.5, widthPct: 0.25 })
    }
  }, [referenceImageUrl])

  // Auto-update prompt when mode or config changes (unless locked)
  useEffect(() => {
    if (isPromptLocked) return
    setPrompt(
      getDefaultPrompt(mode, {
        lightingConfig,
        materialDesc,
        replaceUseRef,
        replaceDesc,
        referenceImageUrl,
      })
    )
  }, [mode, lightingConfig, materialDesc, replaceUseRef, replaceDesc, referenceImageUrl, isPromptLocked])

  /* ---- Mode change handler ---- */
  const handleModeChange = (newMode: EditMode) => {
    setMode(newMode)
    setIsPromptLocked(false)
    setAnnotation(null)
    if (maskPainterRef.current) {
      maskPainterRef.current.clear()
    }

    const config = MODES.find((m) => m.id === newMode)!
    if (!config.showReferenceUpload) {
      setReferenceImageUrl(null)
    }
    if (newMode === "free") {
      setIsInpaintMode(false)
    }
    if (newMode !== "material") setMaterialDesc("")
    if (newMode !== "replace") {
      setReplaceUseRef(true)
      setReplaceDesc("")
    }
    if (newMode !== "lighting") {
      setLightingConfig({
        colorTemp: "neutral",
        brightness: "current",
        atmosphere: "bright",
      })
    }
  }

  /* ---- Upload handlers ---- */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      setError(t("fileSizeError"))
      return
    }
    setIsUploadingMain(true)
    setError(null)
    setAnnotation(null)
    if (maskPainterRef.current) maskPainterRef.current.clear()
    try {
      const url = await uploadImage(file, getAnonymousId(), "main")
      setSelectedImageUrl(url)
    } catch (err: any) {
      setError(err.message || "Upload failed")
    } finally {
      setIsUploadingMain(false)
    }
  }

  const handleReferenceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
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

  const handleImageClickToAnnotate = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!canAnnotate) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    if (x < 0 || x > 1 || y < 0 || y > 1) return
    setAnnotation({ x, y })
  }

  /* ---- Generate handler ---- */
  const handleGenerate = async () => {
    if (!selectedImageUrl) {
      setError("请先上传效果图")
      return
    }
    if (!prompt.trim()) {
      setError("请输入提示词")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImages([])
    setResponseText("")
    setRefinedPrompt("")

    try {
      const anonymousId = getAnonymousId()
      let compositeImageUrl: string | null = null
      let annotatedImageUrl: string | null = null
      let maskImageUrl: string | null = null
      let isPreComposited = false

      const usesInpaint = mode === "free" ? isInpaintMode : currentMode.usesInpaint

      // Inpaint branch
      if (usesInpaint) {
        const maskBlob = await maskPainterRef.current?.exportMask()
        if (!maskBlob) {
          throw new Error("请先在图片上涂抹出要编辑的区域")
        }
        const maskFile = new File([maskBlob], `mask-${Date.now()}.png`, {
          type: "image/png",
        })
        maskImageUrl = await uploadImage(maskFile, anonymousId, "mask")

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: selectedImageUrl,
            maskImageUrl,
            isInpaint: true,
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
          } catch {}
          throw new Error(errorMsg || "Inpaint failed")
        }

        const data = await response.json()
        if (data.images && data.images.length > 0) {
          setGeneratedImages(data.images)
        }
        if (data.refinedPrompt) setRefinedPrompt(data.refinedPrompt)
        if (data.remaining !== undefined) setRemaining(data.remaining)
        if (!data.images || data.images.length === 0) {
          setError(t("noImageGenerated"))
        }
        return
      }

      // Composite / annotation branch
      if (showComposer && referenceImageUrl) {
        const blob = await flattenComposite(selectedImageUrl, referenceImageUrl, layer)
        const file = new File([blob], `composite-${Date.now()}.png`, {
          type: "image/png",
        })
        compositeImageUrl = await uploadImage(file, anonymousId, "composite")
        isPreComposited = true
      } else if (annotation && canAnnotate) {
        const blob = await compositeAnnotatedImage(selectedImageUrl, annotation)
        const file = new File([blob], `annotated-${Date.now()}.png`, {
          type: "image/png",
        })
        annotatedImageUrl = await uploadImage(file, anonymousId, "annotated")
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selectedImageUrl,
          compositeImageUrl,
          annotatedImageUrl: isPreComposited ? null : annotatedImageUrl,
          annotationPosition: isPreComposited ? null : annotation,
          referenceImageUrl: isPreComposited ? null : referenceImageUrl,
          isPreComposited,
          prompt: prompt.trim(),
          anonymousId,
          referenceUsage:
            mode === "free" && !isPreComposited && referenceImageUrl
              ? referenceUsage
              : mode === "add" && !isPreComposited
                ? "add_object"
                : undefined,
          upscale: shouldUpscale,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMsg = text
        try {
          const data = JSON.parse(text)
          errorMsg = data.error || text
        } catch {}
        throw new Error(errorMsg || "Failed to generate image")
      }

      const data = await response.json()
      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images)
      }
      if (data.text) setResponseText(data.text)
      if (data.refinedPrompt) setRefinedPrompt(data.refinedPrompt)
      if (data.remaining !== undefined) setRemaining(data.remaining)

      if ((!data.images || data.images.length === 0) && !data.text) {
        setError(t("noImageGenerated"))
      }
    } catch (err: any) {
      setError(err.message || "生成失败，请稍后重试")
    } finally {
      setIsGenerating(false)
    }
  }

  /* ---- Result handlers ---- */
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
    setAnnotation(null)
    if (maskPainterRef.current) maskPainterRef.current.clear()
    setGeneratedImages([])
    setResponseText("")
    setRefinedPrompt("")
    setError(null)
    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" })
  }

  const clearImage = () => {
    setSelectedImageUrl(null)
    setReferenceImageUrl(null)
    setAnnotation(null)
    if (maskPainterRef.current) maskPainterRef.current.clear()
    setGeneratedImages([])
    setResponseText("")
    setRefinedPrompt("")
    setError(null)
  }

  const clearReferenceImage = () => {
    setReferenceImageUrl(null)
    setError(null)
  }

  /* ---- Render ---- */
  return (
    <section id="generator" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">
              效果图精修工作台
            </h2>
            <p className="text-base text-muted-foreground text-balance max-w-xl mx-auto">
              选择编辑模式，上传效果图，AI 帮您完成专业级精修
            </p>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {MODES.map((m) => {
              const Icon = m.icon
              const isActive = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  disabled={isGenerating}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center",
                    isActive
                      ? m.activeClass
                      : "bg-background border-border hover:border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-current" : m.colorClass)} />
                  <div>
                    <div className="text-xs font-semibold">{m.title}</div>
                    <div
                      className={cn(
                        "text-[10px] leading-tight mt-0.5 hidden md:block",
                        isActive ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      {m.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Quota */}
          {isQuotaExceeded && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive text-sm">{t("quotaExceeded")}</h3>
                  <p className="text-xs text-destructive/80 mt-0.5">{t("quotaExceededDesc")}</p>
                </div>
              </div>
            </div>
          )}
          {remaining !== null && !isQuotaExceeded && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{t("remainingQuota")}</span>
                <span className="text-sm font-bold text-primary">{remaining} / 50</span>
              </div>
            </div>
          )}

          {/* Main Card */}
          <Card className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* ---- LEFT: Input Panel ---- */}
              <div className="space-y-5">
                {/* Main Image Upload / Preview */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    效果图（主图）
                  </Label>

                  {/* Free-mode toggles */}
                  {mode === "free" && selectedImageUrl && !isUploadingMain && (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between p-2.5 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-300/50">
                        <div className="flex-1">
                          <Label htmlFor="inpaint-toggle-free" className="text-xs font-medium cursor-pointer">
                            {t("inpaintToggleLabel")}
                          </Label>
                          <p className="text-[10px] text-muted-foreground">{t("inpaintToggleDesc")}</p>
                        </div>
                        <Switch
                          id="inpaint-toggle-free"
                          checked={isInpaintMode}
                          onCheckedChange={setIsInpaintMode}
                          disabled={isGenerating}
                        />
                      </div>
                      {composerEligible && !isInpaintMode && (
                        <div className="flex items-center justify-between p-2.5 border rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <Label htmlFor="composer-toggle-free" className="text-xs font-medium cursor-pointer">
                              {t("composerToggleLabel")}
                            </Label>
                            <p className="text-[10px] text-muted-foreground">{t("composerToggleDesc")}</p>
                          </div>
                          <Switch
                            id="composer-toggle-free"
                            checked={useComposerPlacement}
                            onCheckedChange={setUseComposerPlacement}
                            disabled={isGenerating}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image display */}
                  {isUploadingMain ? (
                    <div className="relative border-2 border-dashed rounded-lg p-10 text-center bg-muted/30">
                      <div className="flex flex-col items-center justify-center py-6">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-xs text-muted-foreground">{t("uploading")}</p>
                      </div>
                    </div>
                  ) : selectedImageUrl && showMask ? (
                    <div className="space-y-1.5">
                      <div className="relative border-2 rounded-lg p-3 bg-muted/30">
                        <MaskPainter
                          ref={maskPainterRef}
                          mainSrc={selectedImageUrl}
                          disabled={isGenerating}
                          paintLabel={t("inpaintPaint")}
                          eraseLabel={t("inpaintErase")}
                          brushLabel={t("inpaintBrush")}
                          clearLabel={t("inpaintClear")}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-7 w-7"
                          onClick={clearImage}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        {mode === "remove"
                          ? "涂抹想要消除的物品区域，AI 会自动填补背景"
                          : mode === "replace"
                            ? "涂抹想要替换的旧物品"
                            : "涂抹想要更换材质的表面区域"}
                      </p>
                    </div>
                  ) : selectedImageUrl && showComposer && referenceImageUrl ? (
                    <div className="space-y-1.5">
                      <div className="relative border-2 rounded-lg p-3 bg-muted/30">
                        <ReferenceComposer
                          mainSrc={selectedImageUrl}
                          referenceSrc={referenceImageUrl}
                          layer={layer}
                          onChange={setLayer}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-7 w-7"
                          onClick={clearImage}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {t("composerHint")}
                      </p>
                    </div>
                  ) : selectedImageUrl ? (
                    <div className="space-y-1.5">
                      <div className="relative border-2 rounded-lg p-3 bg-muted/30">
                        <div className="relative inline-block mx-auto w-full">
                          <img
                            src={selectedImageUrl}
                            alt="Uploaded"
                            onClick={canAnnotate ? handleImageClickToAnnotate : undefined}
                            className={cn(
                              "max-w-full max-h-64 mx-auto object-contain rounded block",
                              canAnnotate && "cursor-crosshair"
                            )}
                          />
                          {annotation && (
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                left: `${annotation.x * 100}%`,
                                top: `${annotation.y * 100}%`,
                                transform: "translate(-50%, -50%)",
                              }}
                            >
                              <div
                                className="rounded-full bg-red-500/25 border-[3px] border-red-600"
                                style={{ width: "40px", height: "40px" }}
                              />
                              <div
                                className="absolute left-1/2 top-1/2 bg-red-600"
                                style={{
                                  width: "52px",
                                  height: "2.5px",
                                  transform: "translate(-50%, -50%)",
                                }}
                              />
                              <div
                                className="absolute left-1/2 top-1/2 bg-red-600"
                                style={{
                                  width: "2.5px",
                                  height: "52px",
                                  transform: "translate(-50%, -50%)",
                                }}
                              />
                              <div
                                className="absolute left-1/2 top-1/2 bg-red-700 rounded-full"
                                style={{
                                  width: "5px",
                                  height: "5px",
                                  transform: "translate(-50%, -50%)",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7"
                          onClick={clearImage}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      {canAnnotate && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] text-muted-foreground flex-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {annotation ? "已标记位置 — 点击图像可移动标记" : "点击图像任意位置标记编辑区域"}
                          </p>
                          {annotation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[10px] h-6 px-2"
                              onClick={() => setAnnotation(null)}
                            >
                              清除标记
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="relative border-2 border-dashed rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      <div className="space-y-3">
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">点击上传效果图</p>
                          <p className="text-xs text-muted-foreground mt-1">{t("maxSize")}</p>
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

                {/* Reference Image */}
                {(mode === "free" || currentMode.showReferenceUpload) && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {mode === "add"
                        ? "参考物品图（必需）"
                        : mode === "replace"
                          ? "新物品参考图"
                          : mode === "material"
                            ? "材质样板图（可选）"
                            : t("styleReferenceImage")}
                    </Label>
                    {mode !== "free" && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {mode === "add"
                          ? "上传想要添加到场景中的物品图片"
                          : mode === "replace"
                            ? "上传新物品图片，或用文字描述替代"
                            : mode === "material"
                              ? "上传材质样板图作为参考，或直接描述材质"
                              : ""}
                      </p>
                    )}
                    {mode === "free" && (
                      <p className="text-xs text-muted-foreground mb-2">{t("styleReferenceDesc")}</p>
                    )}
                    <div
                      className="relative border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
                      onClick={() =>
                        !isUploadingRef &&
                        document.getElementById("reference-image-upload")?.click()
                      }
                    >
                      {isUploadingRef ? (
                        <div className="flex flex-col items-center justify-center py-4">
                          <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                          <p className="text-xs text-muted-foreground">{t("uploading")}</p>
                        </div>
                      ) : referenceImageUrl ? (
                        <>
                          <img
                            src={referenceImageUrl}
                            alt="Reference"
                            className="max-w-full h-24 mx-auto object-contain rounded"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              clearReferenceImage()
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                          <p className="text-xs font-medium">
                            {mode === "add" ? "点击上传物品参考图" : "点击上传参考图"}
                          </p>
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

                    {/* Reference usage selector (free mode only) */}
                    {mode === "free" && referenceImageUrl && (
                      <div className="mt-2">
                        <Label className="text-xs font-medium mb-1 block">{t("referenceUsageLabel")}</Label>
                        <Select
                          value={referenceUsage}
                          onValueChange={(v) => setReferenceUsage(v as ReferenceUsage)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add_object">{t("referenceUsageAddObject")}</SelectItem>
                            <SelectItem value="style">{t("referenceUsageStyle")}</SelectItem>
                            <SelectItem value="background">{t("referenceUsageBackground")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode-specific controls */}
                {mode === "replace" && (
                  <div className="space-y-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">替换方式</Label>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setReplaceUseRef(true)}
                          className={cn(
                            "px-2.5 py-1 text-[10px] font-medium rounded-md transition-all",
                            replaceUseRef
                              ? "bg-blue-600 text-white"
                              : "bg-white text-muted-foreground"
                          )}
                        >
                          使用参考图
                        </button>
                        <button
                          onClick={() => setReplaceUseRef(false)}
                          className={cn(
                            "px-2.5 py-1 text-[10px] font-medium rounded-md transition-all",
                            !replaceUseRef
                              ? "bg-blue-600 text-white"
                              : "bg-white text-muted-foreground"
                          )}
                        >
                          文字描述
                        </button>
                      </div>
                    </div>
                    {!replaceUseRef && (
                      <div>
                        <Label className="text-[10px] text-muted-foreground mb-1 block">新物品描述</Label>
                        <Textarea
                          placeholder="例如：一把现代风格的黑色皮质单人沙发"
                          className="min-h-[60px] text-xs resize-none"
                          value={replaceDesc}
                          onChange={(e) => setReplaceDesc(e.target.value)}
                          disabled={isGenerating}
                        />
                      </div>
                    )}
                  </div>
                )}

                {mode === "material" && (
                  <div className="space-y-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
                    <Label className="text-xs font-semibold">材质描述</Label>
                    <Textarea
                      placeholder="例如：深灰色大理石、胡桃木、哑光金属拉丝..."
                      className="min-h-[60px] text-xs resize-none"
                      value={materialDesc}
                      onChange={(e) => setMaterialDesc(e.target.value)}
                      disabled={isGenerating}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      描述想要更换的材质，也可上传材质样板图作为参考
                    </p>
                  </div>
                )}

                {mode === "lighting" && (
                  <div className="space-y-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900">
                    <Label className="text-xs font-semibold">灯光参数</Label>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">色温</Label>
                      <SegmentedControl
                        options={[
                          { value: "warm", label: "暖光" },
                          { value: "neutral", label: "中性" },
                          { value: "cool", label: "冷光" },
                        ]}
                        value={lightingConfig.colorTemp}
                        onChange={(v) =>
                          setLightingConfig((c) => ({ ...c, colorTemp: v as ColorTemp }))
                        }
                        disabled={isGenerating}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">亮度</Label>
                      <SegmentedControl
                        options={[
                          { value: "brighter", label: "更亮" },
                          { value: "current", label: "当前" },
                          { value: "darker", label: "更暗" },
                        ]}
                        value={lightingConfig.brightness}
                        onChange={(v) =>
                          setLightingConfig((c) => ({ ...c, brightness: v as BrightnessLevel }))
                        }
                        disabled={isGenerating}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">氛围</Label>
                      <SegmentedControl
                        options={[
                          { value: "morning", label: "晨光" },
                          { value: "sunset", label: "夕阳" },
                          { value: "night", label: "夜景" },
                          { value: "overcast", label: "阴天" },
                          { value: "bright", label: "明亮" },
                        ]}
                        value={lightingConfig.atmosphere}
                        onChange={(v) =>
                          setLightingConfig((c) => ({ ...c, atmosphere: v as AtmosphereType }))
                        }
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                )}

                {/* Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt" className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      提示词
                    </Label>
                    {isPromptLocked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6 px-2"
                        onClick={() => {
                          setIsPromptLocked(false)
                          setPrompt(
                            getDefaultPrompt(mode, {
                              lightingConfig,
                              materialDesc,
                              replaceUseRef,
                              replaceDesc,
                              referenceImageUrl,
                            })
                          )
                        }}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        重置为默认
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="prompt"
                    placeholder={
                      mode === "free" ? t("placeholder") : "提示词已根据当前模式自动填充，您可以直接编辑..."
                    }
                    className="min-h-[100px] text-sm resize-none"
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value)
                      setIsPromptLocked(true)
                    }}
                    disabled={isGenerating}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {isPromptLocked
                      ? "您已自定义提示词，模式参数变化将不再自动更新提示词"
                      : "提示词会根据模式参数自动更新，直接编辑即可锁定"}
                  </p>
                </div>

                {/* Upscale toggle */}
                <div className="flex items-center justify-between p-2.5 border rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <Label htmlFor="upscale-toggle" className="text-xs font-medium cursor-pointer">
                      {t("upscaleLabel")}
                    </Label>
                    <p className="text-[10px] text-muted-foreground">{t("upscaleDesc")}</p>
                  </div>
                  <Switch
                    id="upscale-toggle"
                    checked={shouldUpscale}
                    onCheckedChange={setShouldUpscale}
                    disabled={isGenerating}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
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
                    isQuotaExceeded ||
                    (currentMode.referenceRequired && !referenceImageUrl)
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
                      开始精修
                    </>
                  )}
                </Button>
              </div>

              {/* ---- RIGHT: Output Panel ---- */}
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">生成结果</Label>
                  <div className="border-2 rounded-lg p-4 bg-muted/30 min-h-[300px]">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                        <p className="text-base font-medium">{t("generatingImage")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("mayTakeMoments")}</p>
                      </div>
                    ) : generatedImages.length > 0 || responseText ? (
                      <div className="space-y-3">
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
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDownload(img.image_url.url, index)}
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                {t("download")}
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => handleContinueEditing(img.image_url.url)}
                            >
                              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                              {t("continueEditing")}
                            </Button>
                          </div>
                        ))}
                        {refinedPrompt && (
                          <details className="p-2.5 bg-background rounded-lg border text-xs">
                            <summary className="cursor-pointer font-medium">
                              {t("refinedPromptLabel")}
                            </summary>
                            <p className="text-muted-foreground mt-1.5 whitespace-pre-wrap text-[10px] leading-relaxed">
                              {refinedPrompt}
                            </p>
                          </details>
                        )}
                        {responseText && (
                          <div className="p-3 bg-background rounded-lg border">
                            <p className="text-xs text-muted-foreground">{responseText}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
                        <p className="text-base font-medium">精修结果将在此显示</p>
                        <p className="text-xs text-muted-foreground mt-1">上传效果图并选择模式后开始</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
