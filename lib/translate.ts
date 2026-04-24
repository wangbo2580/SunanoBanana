import OpenAI from "openai"

// FLUX / 部分西方模型对中文识别弱，inpaint 分支需要先翻译。
// 其他图像模型（Gemini、Seedream 等）原生多语言，不经过这里。

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://nano-banana.vercel.app",
    "X-Title": "Nano Banana AI Image Editor",
  },
})

const TRANSLATE_SYSTEM = `You are a strict literal translator. Translate the user's input to natural English.

STRICT RULES:
- Output ONLY the English translation. No preamble, no explanation, no headers.
- Translate LITERALLY — preserve every noun, verb, direction word, number, size/position modifier the user wrote.
- Do NOT add details the user did not write (no materials, colors, sizes, lighting, background elements).
- Do NOT remove modifiers the user did write (preserve every word).
- Preserve direction words exactly: 右=right, 左=left, 右上=upper-right, 左下=lower-left.
- Preserve operation verbs exactly: 加/添加=add, 移动/挪=MOVE (must not become "add"), 删除/去掉=remove, 换成=replace, 缩小=shrink, 放大=enlarge.

CHINESE SIGNAGE / DECOR TERMS (use the FULL precise equivalent, never drop compound components):
- 侧招 / 挑招 / 幌子 = "side-mounted projecting sign" (protrudes perpendicular to the wall; NOT a flat plaque)
- 箭头侧招 = "arrow-shaped projecting side sign mounted perpendicular to the wall" (preserve BOTH 箭头 + 侧招)
- 门头 / 店招 / 门头招牌 = "storefront fascia sign"
- 吊牌 / 吊招 = "hanging sign" (suspended from a bracket)
- 灯笼 = "Chinese lantern"
- 牌匾 = "wooden name plaque" (horizontal, above a doorway)
- 对联 / 春联 = "Chinese couplet"
- 门帘 / 布帘 = "door curtain"
- 霓虹灯 = "neon sign"
- 指示牌 / 导视牌 = "directional / wayfinding sign"
- 立牌 = "standing sign"
- 旗帜 / 幡 = "banner flag"

If the input is already mostly in English, return it unchanged (only light cleanup).`

/**
 * 仅翻译（中文→英文），严格禁止扩写。
 * 输入无中文字符时快速路径直接返回原文。
 */
export async function translateToEnglish(text: string): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return ""

  // 无中日韩字符 → 不调 API
  if (!/[一-鿿぀-ヿ]/.test(trimmed)) {
    return trimmed
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: TRANSLATE_SYSTEM },
        { role: "user", content: trimmed },
      ],
      temperature: 0.1,
      max_tokens: 300,
    })
    const result = completion.choices[0]?.message?.content?.trim()
    return result && result.length > 0 ? result : trimmed
  } catch (err) {
    console.error("Translation failed, using original:", err)
    return trimmed
  }
}
