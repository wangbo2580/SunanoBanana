"use client"

import { useState } from "react"
import { Loader2, ImageIcon, Download, AlertCircle, Wand2, ChevronDown, ChevronUp, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ResultStatus = "idle" | "loading" | "success" | "error"

interface ResultDisplayProps {
  status: ResultStatus
  originalImage?: string | null
  resultImage?: string | null
  error?: string | null
  iteration?: number
  onDownload?: () => void
  onRetry?: () => void
  onIterate?: (prompt: string, strength: "subtle" | "strong") => void
}

export function ResultDisplay({
  status,
  originalImage,
  resultImage,
  error,
  iteration = 0,
  onDownload,
  onRetry,
  onIterate,
}: ResultDisplayProps) {
  const [showIterate, setShowIterate] = useState(false)
  const [iteratePrompt, setIteratePrompt] = useState("")
  const [strength, setStrength] = useState<"subtle" | "strong">("subtle")

  const handleIterateSubmit = () => {
    if (!iteratePrompt.trim() || !onIterate || !resultImage) return
    onIterate(iteratePrompt.trim(), strength)
  }

  return (
    <div className="space-y-4">
      {/* 结果展示区 */}
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
            <p className="text-lg font-medium">
              {iteration > 0 ? `正在生成优化版本（迭代 ${iteration + 1}）...` : "AI 正在生成..."}
            </p>
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
            {iteration > 1 && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <History className="w-4 h-4" />
                <span>当前为第 {iteration} 次迭代优化版本</span>
              </div>
            )}

            {originalImage && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {iteration > 1 ? "上一次生成结果（参考）" : "原图"}
                </p>
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full rounded-lg border opacity-80"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {iteration > 1 ? `优化版本 ${iteration}` : "生成结果"}
              </p>
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

      {/* 迭代优化面板 */}
      {status === "success" && resultImage && onIterate && (
        <div className="border rounded-lg bg-card">
          <button
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
            onClick={() => setShowIterate(!showIterate)}
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              <span className="font-semibold">继续优化</span>
              <span className="text-xs text-muted-foreground">
                在当前结果基础上微调，保持整体一致
              </span>
            </div>
            {showIterate ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showIterate && (
            <div className="px-5 pb-5 border-t">
              <div className="pt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    描述你想要的调整
                  </label>
                  <Textarea
                    placeholder="例如：沙发改为深蓝色真皮、墙面调暖一点、去掉地毯..."
                    className="min-h-[80px]"
                    value={iteratePrompt}
                    onChange={(e) => setIteratePrompt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    系统会保持整体构图和空间结构不变，仅做指定调整，严禁新增任何物体
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">变化幅度</label>
                  <Select
                    value={strength}
                    onValueChange={(v) => setStrength(v as "subtle" | "strong")}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtle">🎨 微调（推荐）- 保持高度一致</SelectItem>
                      <SelectItem value="strong">✨ 较大调整 - 允许更多变化</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleIterateSubmit}
                    disabled={!iteratePrompt.trim() || status === "loading"}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    基于当前结果生成
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIteratePrompt("")
                      setShowIterate(false)
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
