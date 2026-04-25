"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { StoryboardConfig } from "@/lib/prompt-templates"

interface StoryboardConfigProps {
  value: StoryboardConfig
  onChange: (config: StoryboardConfig) => void
}

export function StoryboardConfigPanel({ value, onChange }: StoryboardConfigProps) {
  const update = (partial: Partial<StoryboardConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">分镜氛围</Label>
        <Select value={value.theme} onValueChange={(v) => update({ theme: v as StoryboardConfig["theme"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">日常生活</SelectItem>
            <SelectItem value="artistic">艺术电影</SelectItem>
            <SelectItem value="commercial">商业摄影</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">标注语言</Label>
        <Select value={value.language} onValueChange={(v) => update({ language: v as StoryboardConfig["language"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="en">英文</SelectItem>
            <SelectItem value="bilingual">中英双语</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
