"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { RenderConfig } from "@/lib/prompt-templates"

interface RenderConfigProps {
  value: RenderConfig
  onChange: (config: RenderConfig) => void
}

export function RenderConfigPanel({ value, onChange }: RenderConfigProps) {
  const update = (partial: Partial<RenderConfig>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">风格倾向</Label>
        <Select value={value.style} onValueChange={(v) => update({ style: v as RenderConfig["style"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="natural">自然写实</SelectItem>
            <SelectItem value="warm">暖调温馨</SelectItem>
            <SelectItem value="cool">冷调现代</SelectItem>
            <SelectItem value="luxury">奢华高级</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">输出质量</Label>
        <Select value={value.quality} onValueChange={(v) => update({ quality: v as RenderConfig["quality"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2k">2K 高清</SelectItem>
            <SelectItem value="4k">4K 超高清</SelectItem>
            <SelectItem value="8k">8K 极致</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">添加人物</Label>
          <p className="text-xs text-muted-foreground">在场景中添加人物增强氛围</p>
        </div>
        <Switch
          checked={value.addFigure}
          onCheckedChange={(checked) => update({ addFigure: checked })}
        />
      </div>

      {value.addFigure && (
        <div>
          <Label className="text-sm font-medium mb-2 block">人物效果</Label>
          <Select value={value.figureEffect} onValueChange={(v) => update({ figureEffect: v as RenderConfig["figureEffect"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blur">长曝光虚焦</SelectItem>
              <SelectItem value="clear">清晰呈现</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="pt-2 border-t">
        <Label className="text-sm font-medium mb-2 block">定制化要求（可选）</Label>
        <p className="text-xs text-muted-foreground mb-2">
          指定图中某些物品的规格、材质、样式等，例如："沙发改为焦糖色真皮"、"茶几换成大理石台面"
        </p>
        <Textarea
          placeholder="输入定制化要求..."
          className="min-h-[80px] text-sm"
          value={value.customRequirements}
          onChange={(e) => update({ customRequirements: e.target.value })}
        />
      </div>
    </div>
  )
}
