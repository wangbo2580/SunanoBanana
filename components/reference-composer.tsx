"use client"

import { useEffect, useRef, useState } from "react"

export interface LayerTransform {
  xPct: number // center x as 0-1 of main image
  yPct: number // center y as 0-1
  widthPct: number // layer width as 0-1 of main image width
}

interface Props {
  mainSrc: string
  referenceSrc: string
  layer: LayerTransform
  onChange: (next: LayerTransform) => void
  className?: string
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Image load failed"))
    img.src = src
  })
}

export async function flattenComposite(
  mainSrc: string,
  referenceSrc: string,
  layer: LayerTransform
): Promise<Blob> {
  const [mainRes, refRes] = await Promise.all([
    fetch(mainSrc, { mode: "cors", cache: "reload" }),
    fetch(referenceSrc, { mode: "cors", cache: "reload" }),
  ])
  if (!mainRes.ok) throw new Error(`Main fetch failed: ${mainRes.status}`)
  if (!refRes.ok) throw new Error(`Reference fetch failed: ${refRes.status}`)

  const mainBlob = await mainRes.blob()
  const refBlob = await refRes.blob()
  const mainUrl = URL.createObjectURL(mainBlob)
  const refUrl = URL.createObjectURL(refBlob)

  try {
    const [mainImg, refImg] = await Promise.all([
      loadImage(mainUrl),
      loadImage(refUrl),
    ])

    const canvas = document.createElement("canvas")
    canvas.width = mainImg.naturalWidth
    canvas.height = mainImg.naturalHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2D context not available")

    ctx.drawImage(mainImg, 0, 0)

    const refAspect = refImg.naturalWidth / refImg.naturalHeight
    const refWidth = layer.widthPct * canvas.width
    const refHeight = refWidth / refAspect
    const cx = layer.xPct * canvas.width
    const cy = layer.yPct * canvas.height
    const drawX = cx - refWidth / 2
    const drawY = cy - refHeight / 2
    ctx.drawImage(refImg, drawX, drawY, refWidth, refHeight)

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
    URL.revokeObjectURL(mainUrl)
    URL.revokeObjectURL(refUrl)
  }
}

export function ReferenceComposer({
  mainSrc,
  referenceSrc,
  layer,
  onChange,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [refAspect, setRefAspect] = useState(1)
  const dragState = useRef<{
    mode: "move" | "resize"
    startClientX: number
    startClientY: number
    startLayer: LayerTransform
    rectWidth: number
    rectHeight: number
  } | null>(null)
  const [, force] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadImage(referenceSrc)
      .then((img) => {
        if (!cancelled && img.naturalHeight > 0) {
          setRefAspect(img.naturalWidth / img.naturalHeight)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [referenceSrc])

  const beginDrag =
    (mode: "move" | "resize") => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const container = containerRef.current
      if (!container) return
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      const rect = container.getBoundingClientRect()
      dragState.current = {
        mode,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startLayer: { ...layer },
        rectWidth: rect.width,
        rectHeight: rect.height,
      }
      force((n) => n + 1)
    }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current
    if (!ds) return
    const dx = (e.clientX - ds.startClientX) / ds.rectWidth
    const dy = (e.clientY - ds.startClientY) / ds.rectHeight

    if (ds.mode === "move") {
      onChange({
        ...ds.startLayer,
        xPct: clamp(ds.startLayer.xPct + dx, 0.03, 0.97),
        yPct: clamp(ds.startLayer.yPct + dy, 0.03, 0.97),
      })
    } else {
      // resize via bottom-right handle: grow width by dx, clamp
      const next = clamp(ds.startLayer.widthPct + dx, 0.05, 0.95)
      onChange({ ...ds.startLayer, widthPct: next })
    }
  }

  const onPointerUp = () => {
    dragState.current = null
    force((n) => n + 1)
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full select-none ${className}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={mainSrc}
        alt="Main"
        className="w-full h-auto block rounded"
        draggable={false}
      />
      <div
        className="absolute border-2 border-dashed border-blue-500/90 bg-blue-500/5 cursor-move touch-none shadow-lg"
        style={{
          left: `${layer.xPct * 100}%`,
          top: `${layer.yPct * 100}%`,
          width: `${layer.widthPct * 100}%`,
          aspectRatio: String(refAspect),
          transform: "translate(-50%, -50%)",
        }}
        onPointerDown={beginDrag("move")}
      >
        <img
          src={referenceSrc}
          alt="Reference overlay"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none"
        />
        <div
          role="button"
          aria-label="Resize"
          className="absolute -right-2 -bottom-2 w-5 h-5 rounded-full bg-blue-600 border-2 border-white cursor-nwse-resize shadow-md touch-none"
          onPointerDown={beginDrag("resize")}
        />
      </div>
    </div>
  )
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}
