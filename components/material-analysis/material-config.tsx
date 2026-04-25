"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MaterialAnalysisConfig } from "@/lib/prompt-templates"

interface MaterialConfigProps {
  value: MaterialAnalysisConfig
  onChange: (config: MaterialAnalysisConfig) => void
}

export function MaterialConfigPanel({ value, onChange }: MaterialConfigProps) {
  const update = (partial: Partial<MaterialAnalysisConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">标注语言</Label>
        <Select value={value.language} onValueChange={(v) => update({ language: v as MaterialAnalysisConfig["language"] })}>
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
