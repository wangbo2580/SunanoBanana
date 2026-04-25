"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FloorplanConfig } from "@/lib/prompt-templates"

interface FloorplanConfigProps {
  value: FloorplanConfig
  onChange: (config: FloorplanConfig) => void
}

const STYLES = [
  { id: "hand-drawn", name: "手绘质感" },
  { id: "marker", name: "马克笔风格" },
  { id: "mid-century", name: "中古风" },
  { id: "neo-chinese", name: "新中式禅意" },
  { id: "cartoon", name: "治愈系卡通" },
  { id: "cream", name: "奶油风" },
  { id: "marble-gray", name: "深灰大理石" },
  { id: "flat-minimal", name: "2D扁平极简" },
]

export function FloorplanConfigPanel({ value, onChange }: FloorplanConfigProps) {
  const update = (partial: Partial<FloorplanConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">风格模板</Label>
        <Select value={value.style} onValueChange={(v) => update({ style: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLES.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">标注语言</Label>
        <Select value={value.language} onValueChange={(v) => update({ language: v as FloorplanConfig["language"] })}>
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
