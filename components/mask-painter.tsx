"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Brush, Eraser, Trash2 } from "lucide-react"

export interface MaskPainterHandle {
  exportMask: () => Promise<Blob | null>
  clear: () => void
  hasMask: () => boolean
}

interface Props {
  mainSrc: string
  disabled?: boolean
  brushLabel?: string
  paintLabel?: string
  eraseLabel?: string
  clearLabel?: string
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const res = await fetch(src, { mode: "cors", cache: "reload" })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Image decode failed"))
      img.src = url
    })
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}

export const MaskPainter = forwardRef<MaskPainterHandle, Props>(
  function MaskPainter(
    {
      mainSrc,
      disabled,
      brushLabel = "Brush",
      paintLabel = "Paint",
      eraseLabel = "Erase",
      clearLabel = "Clear",
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [brushSize, setBrushSize] = useState(40)
    const [mode, setMode] = useState<"paint" | "erase">("paint")
    const [hasAnyMask, setHasAnyMask] = useState(false)
    const [naturalSize, setNaturalSize] = useState<{
      w: number
      h: number
    } | null>(null)
    const [imgLoaded, setImgLoaded] = useState(false)
    const lastPoint = useRef<{ x: number; y: number } | null>(null)

    useEffect(() => {
      setImgLoaded(false)
      let cancelled = false
      loadImage(mainSrc)
        .then((img) => {
          if (cancelled) return
          setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
          setImgLoaded(true)
        })
        .catch((e) => {
          console.error("MaskPainter: failed to load image", e)
        })
      return () => {
        cancelled = true
      }
    }, [mainSrc])

    useEffect(() => {
      if (!naturalSize || !canvasRef.current) return
      const canvas = canvasRef.current
      canvas.width = naturalSize.w
      canvas.height = naturalSize.h
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasAnyMask(false)
    }, [naturalSize])

    function pointerToCanvas(
      e: React.PointerEvent<HTMLCanvasElement>
    ): { x: number; y: number } | null {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return null
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height
      return { x, y }
    }

    function brushRadiusInCanvasSpace() {
      const canvas = canvasRef.current
      if (!canvas) return brushSize / 2
      const rect = canvas.getBoundingClientRect()
      const scale = rect.width > 0 ? canvas.width / rect.width : 1
      return (brushSize / 2) * scale
    }

    function drawSegment(
      from: { x: number; y: number },
      to: { x: number; y: number }
    ) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return
      const radius = brushRadiusInCanvasSpace()
      ctx.lineWidth = radius * 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (mode === "paint") {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = "rgba(220, 30, 30, 1)"
      } else {
        ctx.globalCompositeOperation = "destination-out"
        ctx.strokeStyle = "rgba(0, 0, 0, 1)"
      }
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
    }

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return
      e.preventDefault()
      try {
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      } catch {
        // ignore
      }
      setIsDrawing(true)
      const pt = pointerToCanvas(e)
      if (pt) {
        lastPoint.current = pt
        drawSegment(pt, pt)
        if (mode === "paint") setHasAnyMask(true)
      }
    }

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing || disabled) return
      const pt = pointerToCanvas(e)
      if (pt && lastPoint.current) {
        drawSegment(lastPoint.current, pt)
        lastPoint.current = pt
      }
    }

    const onPointerUp = () => {
      setIsDrawing(false)
      lastPoint.current = null
      // Check if canvas still has any non-transparent pixel
      const canvas = canvasRef.current
      if (canvas && mode === "erase") {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
          let any = false
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) {
              any = true
              break
            }
          }
          setHasAnyMask(any)
        }
      }
    }

    const clear = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasAnyMask(false)
    }

    useImperativeHandle(
      ref,
      () => ({
        hasMask: () => hasAnyMask,
        clear,
        exportMask: async () => {
          const canvas = canvasRef.current
          if (!canvas || !hasAnyMask) return null
          const out = document.createElement("canvas")
          out.width = canvas.width
          out.height = canvas.height
          const outCtx = out.getContext("2d")
          if (!outCtx) return null

          outCtx.fillStyle = "black"
          outCtx.fillRect(0, 0, out.width, out.height)

          const srcCtx = canvas.getContext("2d")
          if (!srcCtx) return null
          const srcData = srcCtx.getImageData(0, 0, canvas.width, canvas.height)
          const outImg = outCtx.getImageData(0, 0, out.width, out.height)
          for (let i = 0; i < srcData.data.length; i += 4) {
            if (srcData.data[i + 3] > 12) {
              outImg.data[i] = 255
              outImg.data[i + 1] = 255
              outImg.data[i + 2] = 255
              outImg.data[i + 3] = 255
            }
          }
          outCtx.putImageData(outImg, 0, 0)

          return await new Promise<Blob | null>((resolve) => {
            out.toBlob((b) => resolve(b), "image/png")
          })
        },
      }),
      [hasAnyMask]
    )

    return (
      <div className="space-y-2">
        <div
          ref={containerRef}
          className="relative inline-block w-full bg-black/5 rounded overflow-hidden"
        >
          <img
            src={mainSrc}
            alt="Main"
            className="w-full h-auto block select-none"
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full touch-none opacity-50 ${
              disabled ? "cursor-not-allowed" : "cursor-crosshair"
            }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ visibility: imgLoaded ? "visible" : "hidden" }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant={mode === "paint" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("paint")}
            disabled={disabled}
          >
            <Brush className="w-4 h-4 mr-1" />
            {paintLabel}
          </Button>
          <Button
            type="button"
            variant={mode === "erase" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("erase")}
            disabled={disabled}
          >
            <Eraser className="w-4 h-4 mr-1" />
            {eraseLabel}
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-[140px] ml-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {brushLabel} {brushSize}
            </span>
            <Slider
              min={5}
              max={120}
              step={1}
              value={[brushSize]}
              onValueChange={([v]) => setBrushSize(v)}
              disabled={disabled}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={disabled || !hasAnyMask}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {clearLabel}
          </Button>
        </div>
      </div>
    )
  }
)
