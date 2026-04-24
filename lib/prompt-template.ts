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
- If a second reference image is provided, explicitly reference it: "using the object from the second reference image" or "in the style of the second reference image" or "replacing the background with the scene from the second reference image".
- Output ONLY the rewritten instruction. No preamble, no explanation, no code fences, no Markdown headers.`

function referenceHint(
  hasReferenceImage: boolean,
  usage: ReferenceUsage
): string {
  if (!hasReferenceImage || usage === "none") return ""
  if (usage === "add_object") {
    return "\n\nContext: A second reference image is provided. Insert the object/element shown in the reference image into the main image."
  }
  if (usage === "style") {
    return "\n\nContext: A second reference image is provided. Apply the visual style, color palette, and mood of the reference image to the main image while keeping the main subject recognizable."
  }
  if (usage === "background") {
    return "\n\nContext: A second reference image is provided. Replace the main image's background with the scene from the reference image. Keep the main subject intact and relight it to match the new background."
  }
  return ""
}

export async function rewritePrompt(
  userPrompt: string,
  usage: ReferenceUsage = "none",
  hasReferenceImage: boolean = false
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + referenceHint(hasReferenceImage, usage),
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 400,
    })

    const rewritten = completion.choices[0]?.message?.content?.trim()
    return rewritten && rewritten.length > 10 ? rewritten : userPrompt
  } catch (err) {
    console.error("Prompt rewrite failed, falling back to original:", err)
    return userPrompt
  }
}
