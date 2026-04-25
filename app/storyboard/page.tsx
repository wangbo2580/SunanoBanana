"use client"

import { useState } from "react"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UploadZone } from "@/components/scenes/upload-zone"
import { ResultDisplay } from "@/components/scenes/result-display"
import { useSceneGenerate } from "@/components/scenes/use-scene-generate"
import { StoryboardConfigPanel } from "@/components/storyboard/storyboard-config"
import { buildPrompt } from "@/lib/prompt-templates"
import type { StoryboardConfig } from "@/lib/prompt-templates"

export default function StoryboardPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [config, setConfig] = useState<StoryboardConfig>({
    theme: "artistic",
    language: "bilingual",
  })

  const { status, resultImage, error, generate, reset } = useSceneGenerate()

  const handleGenerate = async () => {
    if (!imageUrl) return
    await generate(imageUrl, buildPrompt("storyboard", config))
  }

  const handleReset = () => {
    setImageUrl(null)
    reset()
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回首页
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">室内分镜</h1>
            <p className="text-muted-foreground">生成9宫格空间摄影导演分镜，保持空间结构与氛围</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">上传室内照片</h3>
                <UploadZone value={imageUrl} onChange={(url) => { setImageUrl(url); reset() }} label="上传室内场景照片" hint="建议上传构图完整的室内空间照片" />
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">生成配置</h3>
                <StoryboardConfigPanel value={config} onChange={setConfig} />
              </Card>

              <Button className="w-full" size="lg" onClick={handleGenerate} disabled={!imageUrl || status === "loading"}>
                {status === "loading" ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" />生成中...</> : <><Sparkles className="w-4 h-4 mr-2" />开始生成</>}
              </Button>
              {imageUrl && <Button variant="outline" className="w-full" onClick={handleReset} disabled={status === "loading"}>重新上传</Button>}
            </div>

            <div className="lg:col-span-3">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">生成结果</h3>
                <ResultDisplay status={status} originalImage={imageUrl} resultImage={resultImage} error={error} onRetry={handleGenerate} onDownload={() => { if (resultImage) { const a = document.createElement("a"); a.href = resultImage; a.download = `banana-storyboard-${Date.now()}.png`; a.target = "_blank"; a.click(); } }} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
