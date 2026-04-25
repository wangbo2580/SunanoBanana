"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ElevationConfig } from "@/lib/prompt-templates"

interface ElevationConfigProps {
  value: ElevationConfig
  onChange: (config: ElevationConfig) => void
}

export function ElevationConfigPanel({ value, onChange }: ElevationConfigProps) {
  const update = (partial: Partial<ElevationConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">图纸风格</Label>
        <Select value={value.style} onValueChange={(v) => update({ style: v as ElevationConfig["style"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revit">Revit建模</SelectItem>
            <SelectItem value="sketch">手绘线稿</SelectItem>
            <SelectItem value="minimal">极简CAD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">标注语言</Label>
        <Select value={value.language} onValueChange={(v) => update({ language: v as ElevationConfig["language"] })}>
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
