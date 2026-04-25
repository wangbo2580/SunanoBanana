"use client"

import { useState, useCallback } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { uploadImage } from "@/lib/supabase/upload-client"

function getAnonymousId(): string {
  let id = localStorage.getItem("anonymous_id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("anonymous_id", id)
  }
  return id
}

interface UploadZoneProps {
  value: string | null
  onChange: (url: string | null) => void
  label: string
  hint?: string
  maxSizeMB?: number
}

export function UploadZone({
  value,
  onChange,
  label,
  hint = "支持 JPG、PNG 格式",
  maxSizeMB = 20,
}: UploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`文件大小不能超过 ${maxSizeMB}MB`)
        return
      }
      setIsUploading(true)
      setError(null)
      try {
        const url = await uploadImage(file, getAnonymousId(), "main")
        onChange(url)
      } catch (err: any) {
        setError(err.message || "上传失败")
      } finally {
        setIsUploading(false)
      }
    },
    [maxSizeMB, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("image/")) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  if (value) {
    return (
      <div className="relative border-2 rounded-lg p-4 bg-muted/30">
        <img
          src={value}
          alt="Uploaded"
          className="max-w-full max-h-72 mx-auto object-contain rounded"
        />
        <button
          onClick={() => {
            onChange(null)
            setError(null)
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        className="relative border-2 border-dashed rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
        onClick={() => document.getElementById("scene-image-upload")?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">上传中...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">{hint}</p>
              <p className="text-xs text-muted-foreground mt-0.5">点击或拖拽上传</p>
            </div>
          </div>
        )}
      </div>
      <input
        id="scene-image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  )
}
