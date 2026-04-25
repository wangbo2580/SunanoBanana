"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ColorAnalysisConfig } from "@/lib/prompt-templates"

interface ColorConfigProps {
  value: ColorAnalysisConfig
  onChange: (config: ColorAnalysisConfig) => void
}

export function ColorConfigPanel({ value, onChange }: ColorConfigProps) {
  const update = (partial: Partial<ColorAnalysisConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">展板风格</Label>
        <Select value={value.theme} onValueChange={(v) => update({ theme: v as ColorAnalysisConfig["theme"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimal">极简白底</SelectItem>
            <SelectItem value="dark">深色高端</SelectItem>
            <SelectItem value="warm">暖色温馨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">输出语言</Label>
        <Select value={value.language} onValueChange={(v) => update({ language: v as ColorAnalysisConfig["language"] })}>
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
