"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FloorplanTo3DConfig } from "@/lib/prompt-templates"

interface FloorplanTo3DConfigProps {
  value: FloorplanTo3DConfig
  onChange: (config: FloorplanTo3DConfig) => void
}

export function FloorplanTo3DConfigPanel({ value, onChange }: FloorplanTo3DConfigProps) {
  const update = (partial: Partial<FloorplanTo3DConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">目标区域</Label>
        <Select value={value.area} onValueChange={(v) => update({ area: v as FloorplanTo3DConfig["area"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="living">客厅</SelectItem>
            <SelectItem value="bedroom">卧室</SelectItem>
            <SelectItem value="dining">餐厅</SelectItem>
            <SelectItem value="study">书房</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">设计风格</Label>
        <Select value={value.style} onValueChange={(v) => update({ style: v as FloorplanTo3DConfig["style"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern-luxury">现代轻奢</SelectItem>
            <SelectItem value="mid-century">中古风</SelectItem>
            <SelectItem value="cream">奶油风</SelectItem>
            <SelectItem value="neo-chinese">新中式</SelectItem>
            <SelectItem value="industrial">工业风</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
