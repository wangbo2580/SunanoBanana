"use client"

import { Loader2, ImageIcon, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type ResultStatus = "idle" | "loading" | "success" | "error"

interface ResultDisplayProps {
  status: ResultStatus
  originalImage?: string | null
  resultImage?: string | null
  error?: string | null
  onDownload?: () => void
  onRetry?: () => void
}

export function ResultDisplay({
  status,
  originalImage,
  resultImage,
  error,
  onDownload,
  onRetry,
}: ResultDisplayProps) {
  return (
    <div className="border-2 rounded-lg p-6 bg-muted/30 min-h-[400px]">
      {status === "idle" && (
        <div className="flex flex-col items-center justify-center h-full min-h-[350px]">
          <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">AI 生成结果将在此显示</p>
          <p className="text-sm text-muted-foreground mt-2">
            上传图片并点击生成按钮
          </p>
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center h-full min-h-[350px]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium">AI 正在生成...</p>
          <p className="text-sm text-muted-foreground mt-2">
            预计需要 10-30 秒，请耐心等待
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center h-full min-h-[350px]">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-lg font-medium text-destructive">生成失败</p>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
            {error || "请稍后重试，或尝试更换图片"}
          </p>
          {onRetry && (
            <Button variant="outline" className="mt-4" onClick={onRetry}>
              重试
            </Button>
          )}
        </div>
      )}

      {status === "success" && resultImage && (
        <div className="space-y-4">
          {originalImage && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">原图</p>
              <img
                src={originalImage}
                alt="Original"
                className="w-full rounded-lg border"
              />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">生成结果</p>
            <div className="relative group">
              <img
                src={resultImage}
                alt="Generated"
                className="w-full rounded-lg shadow-lg"
              />
              {onDownload && (
                <Button
                  size="sm"
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={onDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
