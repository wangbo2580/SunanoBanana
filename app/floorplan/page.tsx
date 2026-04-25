"use client"

import { useState } from "react"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UploadZone } from "@/components/scenes/upload-zone"
import { ResultDisplay } from "@/components/scenes/result-display"
import { useSceneGenerate } from "@/components/scenes/use-scene-generate"
import { FloorplanConfigPanel } from "@/components/floorplan/floorplan-config"
import { buildPrompt } from "@/lib/prompt-templates"
import type { FloorplanConfig } from "@/lib/prompt-templates"

export default function FloorplanPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [config, setConfig] = useState<FloorplanConfig>({
    style: "hand-drawn",
    language: "bilingual",
  })

  const { status, resultImage, error, generate, reset } = useSceneGenerate()

  const handleGenerate = async () => {
    if (!imageUrl) return
    await generate(imageUrl, buildPrompt("floorplan", config))
  }

  const handleReset = () => {
    setImageUrl(null)
    reset()
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
            <h1 className="text-3xl font-bold mb-2">彩平图生成</h1>
            <p className="text-muted-foreground">
              将平面户型线稿图一键转换为多种风格的彩色平面图
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">上传平面图</h3>
                <UploadZone
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url)
                    reset()
                  }}
                  label="上传平面户型图"
                  hint="支持线稿、黑白或简单填充的户型图"
                />
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">生成配置</h3>
                <FloorplanConfigPanel value={config} onChange={setConfig} />
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
                  onDownload={() => {
                    if (resultImage) {
                      const link = document.createElement("a")
                      link.href = resultImage
                      link.download = `banana-floorplan-${Date.now()}.png`
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
