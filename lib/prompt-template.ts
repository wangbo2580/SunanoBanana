// Prompt 构造器：纯字符串拼接，不调用任何 LLM。
// 设计原则：
//   - 用户原话原样透传（任何语言），绝不翻译 / 改写 / 扩写
//   - 仅附加结构化上下文（图 #1/#2 是什么、Preservation/Integration/Output 约定）
//   - 现代图像模型（Gemini、Seedream、FLUX 等）原生多语言，中文无需中转

export type ReferenceUsage = "add_object" | "style" | "background" | "none"

export type AnnotationPosition = { x: number; y: number } | null | undefined

interface BuildParams {
  hasReferenceImage: boolean
  usage: ReferenceUsage
  hasAnnotation: boolean
  annotationPosition: AnnotationPosition
  isPreComposited: boolean
}

function buildContextBlock(params: BuildParams): string {
  const {
    hasReferenceImage,
    usage,
    hasAnnotation,
    annotationPosition,
    isPreComposited,
  } = params

  // 预合成模式：清洁原图 + 用户合成 mockup
  if (isPreComposited) {
    return `Context: Two images are provided.
Image #1 is the CLEAN base scene — this is the canvas for the final output.
Image #2 is a USER MOCKUP: the user manually placed a reference element onto the scene to communicate three things:
- WHAT the element is — its design, shape, silhouette, material, texture, color palette, any text content, and 3D form / mounting style. These are BINDING requirements: preserve them.
- WHERE they roughly want it — position is an approximate HINT; you may adjust slightly for aesthetic coherence, but stay in the same general region the user indicated.
- HOW BIG they roughly want it — size is an approximate HINT; you may adjust for real-world scale proportional to adjacent objects in the scene.

Re-render the element naturally into Image #1 with matching lighting, shadows, and perspective. Do NOT paste pixels from Image #2; redraw the element as if it were physically present in the scene.`
  }

  const blocks: string[] = []

  // 标记模式：清洁原图 + 带红色十字准心的副本 + 坐标
  if (hasAnnotation) {
    const xPct =
      annotationPosition && typeof annotationPosition.x === "number"
        ? Math.round(annotationPosition.x * 100)
        : null
    const yPct =
      annotationPosition && typeof annotationPosition.y === "number"
        ? Math.round(annotationPosition.y * 100)
        : null
    const coord =
      xPct !== null && yPct !== null
        ? ` is located approximately ${xPct}% from the left edge and ${yPct}% from the top edge of the image`
        : ""

    blocks.push(`Context: Two versions of the scene are provided.
Image #1 is the CLEAN base scene — the final output canvas.
Image #2 is the same scene with a red circular ring and red crosshair drawn on top. The crosshair center${coord}. This marker is a positional guide placed by the user; it is NOT part of the scene.

The user's requested edit must be applied at the crosshair center on Image #1. The final output must contain no trace of the red ring or crosshair. Do not center, relocate, or "improve" the placement.`)
  }

  // 参考图模式
  if (hasReferenceImage) {
    const refN = hasAnnotation ? 3 : 2
    if (usage === "add_object") {
      blocks.push(`Context: Image #${refN} is a REFERENCE showing the object/element the user wants to add.
Preserve its design faithfully: shape, silhouette, material, texture, color palette, any text content verbatim, and its 3D form / mounting style. If the reference depicts a projecting / side-mounted / hanging / arrow-shaped / pennant / lantern / curtain / etc. object, render it with that same 3D form in the output — do NOT flatten a protruding sign into a flat wall plaque, do NOT simplify a compound shape into a generic one.`)
    } else if (usage === "style") {
      blocks.push(`Context: Image #${refN} is a STYLE REFERENCE. Apply its color palette, lighting mood, and texture quality to the main scene while keeping the main subject's content and composition recognizable.`)
    } else if (usage === "background") {
      blocks.push(`Context: Image #${refN} is a BACKGROUND REFERENCE. Replace the main image's background with the scene from this reference. Keep the main subject intact and relight it to match the new background's direction and color temperature.`)
    }
  }

  return blocks.join("\n\n")
}

const STRUCTURAL_WRAPPER = `Preservation: Keep the original composition, subject, lighting direction, perspective, and every element not mentioned in the user's request completely unchanged.
Integration: Render any edit with natural lighting, accurate shadows, correct perspective, and color grading matching the existing scene. The result should look like a single photograph, not a composite.
Output: A single photorealistic image, high detail, sharp focus.`

/**
 * 构造发给图像模型的完整 prompt。
 *
 * 用户原话（中文 / 英文 / 任意语言）会被原样放置，不做任何翻译或改写。
 * 上下文 block 和结构化后缀都是固定英文模板，通过 flags 条件装配。
 */
export async function rewritePrompt(
  userPrompt: string,
  usage: ReferenceUsage = "none",
  hasReferenceImage: boolean = false,
  hasAnnotation: boolean = false,
  annotationPosition: AnnotationPosition = null,
  isPreComposited: boolean = false
): Promise<string> {
  const context = buildContextBlock({
    hasReferenceImage,
    usage,
    hasAnnotation,
    annotationPosition,
    isPreComposited,
  })

  const userBlock = `User's edit request (use verbatim as the authoritative intent):\n${userPrompt.trim()}`

  return [context, userBlock, STRUCTURAL_WRAPPER]
    .filter((s) => s.length > 0)
    .join("\n\n")
}
