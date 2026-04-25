"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, RotateCcw, Save, Check, AlertCircle, ChevronDown, ChevronUp, Settings2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SCENES, getDefaultPrompt } from "@/lib/prompt-templates"
import {
  getAllCustomPrompts,
  setCustomPrompt,
  resetCustomPrompt,
  resetAllCustomPrompts,
} from "@/lib/prompt-storage"

// 排除自由修图（它不需要预设提示词）
const EDITABLE_SCENES = SCENES.filter((s) => s.id !== "edit")

interface ScenePromptState {
  id: string
  title: string
  color: string
  isCustom: boolean
  draft: string
  original: string
  isOpen: boolean
  saved: boolean
}

export default function SettingsPage() {
  const [scenes, setScenes] = useState<ScenePromptState[]>([])
  const [globalResetOpen, setGlobalResetOpen] = useState(false)

  // 初始化：从 localStorage 读取自定义提示词
  useEffect(() => {
    const custom = getAllCustomPrompts()
    const initial = EDITABLE_SCENES.map((scene) => {
      const defaultPrompt = getDefaultPrompt(scene.id)
      const customPrompt = custom[scene.id]
      return {
        id: scene.id,
        title: scene.title,
        color: scene.color,
        isCustom: !!customPrompt,
        draft: customPrompt || defaultPrompt,
        original: defaultPrompt,
        isOpen: false,
        saved: false,
      }
    })
    setScenes(initial)
  }, [])

  const toggleOpen = useCallback((id: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen, saved: false } : s))
    )
  }, [])

  const updateDraft = useCallback((id: string, value: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, draft: value, saved: false } : s))
    )
  }, [])

  const saveScene = useCallback((id: string) => {
    setScenes((prev) => {
      const scene = prev.find((s) => s.id === id)
      if (!scene) return prev
      const trimmed = scene.draft.trim()
      if (trimmed === scene.original.trim()) {
        // 与默认相同，视为重置
        resetCustomPrompt(id)
        return prev.map((s) =>
          s.id === id ? { ...s, isCustom: false, saved: true } : s
        )
      }
      setCustomPrompt(id, trimmed)
      return prev.map((s) =>
        s.id === id ? { ...s, isCustom: true, saved: true } : s
      )
    })
  }, [])

  const resetScene = useCallback((id: string) => {
    resetCustomPrompt(id)
    setScenes((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, draft: s.original, isCustom: false, saved: true }
          : s
      )
    )
  }, [])

  const handleGlobalReset = useCallback(() => {
    resetAllCustomPrompts()
    setScenes((prev) =>
      prev.map((s) => ({
        ...s,
        draft: s.original,
        isCustom: false,
        saved: false,
        isOpen: false,
      }))
    )
    setGlobalResetOpen(false)
  }, [])

  const customCount = scenes.filter((s) => s.isCustom).length

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

        <div className="max-w-4xl mx-auto">
          {/* 标题区 */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Settings2 className="w-8 h-8 text-primary" />
                提示词设置
              </h1>
              <p className="text-muted-foreground">
                自定义各场景的 AI 提示词模板。修改后场景页面将使用您的自定义版本。
              </p>
              {customCount > 0 && (
                <p className="text-sm text-primary mt-2 font-medium">
                  当前有 {customCount} 个场景使用了自定义提示词
                </p>
              )}
            </div>

            <Dialog open={globalResetOpen} onOpenChange={setGlobalResetOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  重置全部
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>确认重置所有提示词？</DialogTitle>
                  <DialogDescription>
                    此操作将清除所有场景的自定义提示词，恢复为系统默认版本。此操作不可撤销。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setGlobalResetOpen(false)}
                  >
                    取消
                  </Button>
                  <Button variant="destructive" onClick={handleGlobalReset}>
                    确认重置
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 使用说明 */}
          <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">使用说明</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>点击场景卡片展开编辑区域</li>
                  <li>修改提示词后点击「保存」生效</li>
                  <li>如果保存的内容与默认版本一致，会自动恢复为默认</li>
                  <li>点击「恢复默认」可快速还原单个场景</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 场景列表 */}
          <div className="space-y-4">
            {scenes.map((scene) => (
              <Card
                key={scene.id}
                className={`overflow-hidden transition-all ${
                  scene.isCustom
                    ? "border-l-4"
                    : "border-l-4 border-l-transparent"
                }`}
                style={
                  scene.isCustom
                    ? { borderLeftColor: scene.color }
                    : undefined
                }
              >
                {/* 卡片头部 */}
                <button
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                  onClick={() => toggleOpen(scene.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: scene.color }}
                    />
                    <span className="font-semibold text-lg">{scene.title}</span>
                    {scene.isCustom && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        已自定义
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {scene.saved && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        已保存
                      </span>
                    )}
                    {scene.isOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* 编辑区域 */}
                {scene.isOpen && (
                  <div className="px-5 pb-5 border-t">
                    <div className="pt-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">
                            提示词内容
                          </label>
                          <span className="text-xs text-muted-foreground">
                            {scene.draft.length} 字符
                          </span>
                        </div>
                        <Textarea
                          value={scene.draft}
                          onChange={(e) =>
                            updateDraft(scene.id, e.target.value)
                          }
                          className="min-h-[200px] font-mono text-sm leading-relaxed"
                          placeholder="在此输入自定义提示词..."
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetScene(scene.id)}
                          disabled={!scene.isCustom}
                          className="text-muted-foreground"
                        >
                          <RotateCcw className="w-4 h-4 mr-1.5" />
                          恢复默认
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleOpen(scene.id)}
                          >
                            取消
                          </Button>
                          <Button size="sm" onClick={() => saveScene(scene.id)}>
                            <Save className="w-4 h-4 mr-1.5" />
                            保存
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
