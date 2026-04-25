"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FurnitureLayoutConfig } from "@/lib/prompt-templates"

interface FurnitureLayoutConfigProps {
  value: FurnitureLayoutConfig
  onChange: (config: FurnitureLayoutConfig) => void
}

export function FurnitureLayoutConfigPanel({ value, onChange }: FurnitureLayoutConfigProps) {
  const update = (partial: Partial<FurnitureLayoutConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">空间类型</Label>
        <Select value={value.roomType} onValueChange={(v) => update({ roomType: v as FurnitureLayoutConfig["roomType"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="living">客厅</SelectItem>
            <SelectItem value="bedroom">卧室</SelectItem>
            <SelectItem value="dining">餐厅</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">设计风格</Label>
        <Select value={value.style} onValueChange={(v) => update({ style: v as FurnitureLayoutConfig["style"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bauhaus">包豪斯</SelectItem>
            <SelectItem value="modern">现代简约</SelectItem>
            <SelectItem value="nordic">北欧风</SelectItem>
            <SelectItem value="japanese">日式禅意</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
