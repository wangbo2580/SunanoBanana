"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FurnitureBreakdownConfig } from "@/lib/prompt-templates"

interface BreakdownConfigProps {
  value: FurnitureBreakdownConfig
  onChange: (config: FurnitureBreakdownConfig) => void
}

export function BreakdownConfigPanel({ value, onChange }: BreakdownConfigProps) {
  const update = (partial: Partial<FurnitureBreakdownConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">背景色</Label>
        <Select value={value.background} onValueChange={(v) => update({ background: v as FurnitureBreakdownConfig["background"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">白色</SelectItem>
            <SelectItem value="gray">浅灰</SelectItem>
            <SelectItem value="beige">米色</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">标注语言</Label>
        <Select value={value.language} onValueChange={(v) => update({ language: v as FurnitureBreakdownConfig["language"] })}>
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

      <div>
        <Label className="text-sm font-medium mb-2 block">排列方式</Label>
        <Select value={value.layout} onValueChange={(v) => update({ layout: v as FurnitureBreakdownConfig["layout"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scattered">错落有致</SelectItem>
            <SelectItem value="grid">网格对齐</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
