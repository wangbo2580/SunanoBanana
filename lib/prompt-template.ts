import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://nano-banana.vercel.app",
    "X-Title": "Nano Banana AI Image Editor",
  },
})

export type ReferenceUsage = "add_object" | "style" | "background" | "none"

export type AnnotationPosition = { x: number; y: number } | null | undefined

const SYSTEM_PROMPT = `You are an expert at writing prompts for the Gemini 2.5 Flash Image (Nano Banana) image editing model.

The user will give you a short, possibly vague, possibly Chinese edit request. Rewrite it into a precise, narrative English editing instruction that Nano Banana will follow accurately.

Follow this structure exactly:

Task: [precise description of what to change: position, size, color, material, style — be concrete even if the user was vague]
Preservation: Keep the original composition, subject likeness, lighting direction, perspective, and every unrelated element completely unchanged.
Integration: Match the existing scene's lighting direction and intensity, cast physically correct shadows, preserve scale and perspective, and blend color grading seamlessly.
Output: A single photorealistic image, high detail, sharp focus, professional quality.

Rules:
- Be specific. "Add something" → "Add [specific object with color, size, material, and position]".
- If the user's request is ambiguous, make a reasonable concrete choice rather than staying vague.
- Output ONLY the rewritten instruction. No preamble, no explanation, no code fences, no Markdown headers.`

function referenceHint(
  hasReferenceImage: boolean,
  usage: ReferenceUsage,
  referenceImageIndex: number
): string {
  if (!hasReferenceImage || usage === "none") return ""
  const idx = referenceImageIndex // 1-based for human readability
  if (usage === "add_object") {
    return `

Context: Image #${idx} is a REFERENCE OBJECT to insert into the main scene.
Your rewritten instruction MUST emphasize strict fidelity to the reference:
- Copy the reference object LITERALLY. Preserve its exact 3D form, shape, silhouette, orientation, mounting style, material, texture, color palette, and any text content character-for-character.
- If the reference object is side-mounted, protruding, or hanging from a wall (e.g. a 侧招 / projecting shop sign / banner / flag), it MUST be rendered side-mounted / protruding / hanging in the output — do NOT flatten it into a wall-mounted plaque or poster.
- If the reference has a distinctive shape (arrow, pennant, circular disc, lantern, hexagon, etc.), preserve that shape exactly.
- Size the object naturally for the main scene (match the apparent scale of nearby real-world objects), but do NOT alter the object's internal proportions.
- Do NOT redesign, reinterpret, simplify, or stylize. Treat the reference image as a literal source to copy.`
  }
  if (usage === "style") {
    return `

Context: Image #${idx} is a STYLE REFERENCE. Apply its color palette, lighting mood, and texture quality to the main image while keeping the main subject's content and composition recognizable.`
  }
  if (usage === "background") {
    return `

Context: Image #${idx} is a BACKGROUND REFERENCE. Replace the main image's background with the scene from this reference. Keep the main subject intact and relight it to match the new background's direction and color temperature.`
  }
  return ""
}

function annotationHint(
  hasAnnotation: boolean,
  position: AnnotationPosition
): string {
  if (!hasAnnotation) return ""
  const xPct = position ? Math.round(position.x * 100) : null
  const yPct = position ? Math.round(position.y * 100) : null
  const coordPhrase =
    xPct !== null && yPct !== null
      ? `approximately ${xPct}% from the left edge and ${yPct}% from the top edge of the image`
      : `at the red crosshair marker`

  return `

Context: TWO images of the main scene are provided.
- Image #1: the CLEAN base scene (no marker, untouched). This is the canvas the final output must be based on.
- Image #2: the SAME scene with a large red circular ring and red crosshair drawn on top. The crosshair center is a positional guide placed by the user — it is NOT part of the scene.

The crosshair center is located ${coordPhrase}.

Your rewritten instruction MUST:
1. Command the model to produce the final edit on top of Image #1 (the clean version). The final output must NOT contain the red ring, crosshair, or any marker.
2. Apply the edit at the EXACT location of the crosshair center — ${coordPhrase}. The position is binding. Do NOT center the edit, do NOT reposition it to a "more natural" location, do NOT average across nearby points. If the user marked the upper-right, the edit goes to the upper-right; if they marked a corner, the edit goes to that corner.
3. Reiterate the position using BOTH wording: "at the position indicated by the user's red crosshair marker in Image #2" AND the numeric coordinate "${coordPhrase}".
4. Every pixel outside the edit region must remain pixel-identical to Image #1.`
}

export async function rewritePrompt(
  userPrompt: string,
  usage: ReferenceUsage = "none",
  hasReferenceImage: boolean = false,
  hasAnnotation: boolean = false,
  annotationPosition: AnnotationPosition = null
): Promise<string> {
  // Image ordering passed to Gemini:
  //   1 = clean base image
  //   2 = annotated image (if hasAnnotation)
  //   next = reference image (if hasReferenceImage)
  const referenceImageIndex = 1 + (hasAnnotation ? 1 : 0) + 1 // 1-based position of reference in content

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            SYSTEM_PROMPT +
            annotationHint(hasAnnotation, annotationPosition) +
            referenceHint(hasReferenceImage, usage, referenceImageIndex),
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 600,
    })

    const rewritten = completion.choices[0]?.message?.content?.trim()
    return rewritten && rewritten.length > 10 ? rewritten : userPrompt
  } catch (err) {
    console.error("Prompt rewrite failed, falling back to original:", err)
    return userPrompt
  }
}
