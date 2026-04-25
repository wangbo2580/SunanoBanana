"use client"

import { useState } from "react"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UploadZone } from "@/components/scenes/upload-zone"
import { ResultDisplay } from "@/components/scenes/result-display"
import { useSceneGenerate } from "@/components/scenes/use-scene-generate"
import { BreakdownConfigPanel } from "@/components/furniture-breakdown/breakdown-config"
import { buildPrompt } from "@/lib/prompt-templates"
import type { FurnitureBreakdownConfig } from "@/lib/prompt-templates"

export default function FurnitureBreakdownPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [config, setConfig] = useState<FurnitureBreakdownConfig>({
    background: "white",
    language: "en",
    layout: "scattered",
  })

  const { status, resultImage, error, generate, reset, iteration } = useSceneGenerate()

  const handleGenerate = async () => {
    if (!imageUrl) return
    await generate(imageUrl, buildPrompt("furniture-breakdown", config))
  }

  const handleReset = () => {
    setImageUrl(null)
    reset()
  }
  const handleIterate = async (iteratePrompt: string, strength: "subtle" | "strong") => {
    if (!resultImage) return
    const prefix = strength === "subtle"
      ? "基于当前图片进行轻微调整"
      : "基于当前图片进行优化修改"
    const constraint = "保持整体空间结构、构图、光影氛围不变，严禁新增任何原图中不存在的物体。"
    const fullPrompt = `${prefix}：${iteratePrompt}。${constraint}`
    await generate(resultImage, fullPrompt)
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回首页
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">软装拆解</h1>
            <p className="text-muted-foreground">
              一键将室内场景中的所有家具拆解为独立单品拼贴展示
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">上传室内照片</h3>
                <UploadZone
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url)
                    reset()
                  }}
                  label="上传室内场景照片"
                  hint="建议家具清晰可见的室内全景照片"
                />
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">生成配置</h3>
                <BreakdownConfigPanel value={config} onChange={setConfig} />
              </Card>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={!imageUrl || status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始生成
                  </>
                )}
              </Button>

              {imageUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                  disabled={status === "loading"}
                >
                  重新上传
                </Button>
              )}
            </div>

            <div className="lg:col-span-3">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">生成结果</h3>
                <ResultDisplay
                  status={status}
                  originalImage={imageUrl}
                  resultImage={resultImage}
                  error={error}
                  iteration={iteration}
                  onIterate={handleIterate}
                  onDownload={() => {
                    if (resultImage) {
                      const link = document.createElement("a")
                      link.href = resultImage
                      link.download = `banana-breakdown-${Date.now()}.png`
                      link.target = "_blank"
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }
                  }}
                  onRetry={handleGenerate}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
