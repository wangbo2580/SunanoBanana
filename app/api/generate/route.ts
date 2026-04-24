import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { rewritePrompt, type ReferenceUsage } from "@/lib/prompt-template"
import { uploadDataUrlToStorage } from "@/lib/supabase/storage"

export const maxDuration = 60

const MAX_USAGE = 50
const IMAGE_MODEL =
  process.env.IMAGE_MODEL || "bytedance-seed/seedream-4.5"
const INPAINT_MODEL =
  process.env.INPAINT_MODEL || "fal-ai/flux-pro/v1/fill"

// 内存存储使用次数（serverless 冷启动会重置，演示用）
const usageMap = new Map<string, number>()

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://nano-banana.vercel.app",
    "X-Title": "Nano Banana AI Image Editor",
  },
})

async function inpaintWithFal(
  imageUrl: string,
  maskUrl: string,
  prompt: string
): Promise<string> {
  const falKey = process.env.FAL_KEY
  if (!falKey) {
    throw new Error("FAL_KEY not configured")
  }
  const res = await fetch(`https://fal.run/${INPAINT_MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      num_images: 1,
      output_format: "png",
      safety_tolerance: "2",
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Inpaint failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  const url =
    data?.images?.[0]?.url ||
    data?.image?.url ||
    (typeof data?.images?.[0] === "string" ? data.images[0] : null)
  if (!url) {
    throw new Error(
      "Inpaint succeeded but no image URL in response: " + JSON.stringify(data)
    )
  }
  return url
}

async function upscaleWithRealEsrgan(imageUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY
  if (!falKey) {
    throw new Error("FAL_KEY not configured")
  }
  const res = await fetch("https://fal.run/fal-ai/real-esrgan", {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      scale: 4,
      face_enhance: false,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Real-ESRGAN failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data?.image?.url || imageUrl
}

export async function POST(request: NextRequest) {
  try {
    const {
      imageUrl,
      compositeImageUrl,
      annotatedImageUrl,
      annotationPosition,
      referenceImageUrl,
      maskImageUrl,
      isInpaint,
      isPreComposited,
      prompt,
      anonymousId,
      referenceUsage,
      upscale: shouldUpscale,
    } = await request.json()

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Anonymous ID is required", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    const currentUsage = usageMap.get(anonymousId) ?? 0
    if (currentUsage >= MAX_USAGE) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          code: "QUOTA_EXCEEDED",
          usage_count: currentUsage,
          max_usage: MAX_USAGE,
          remaining: 0,
        },
        { status: 403 }
      )
    }

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: "Image and prompt are required", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    // === Inpaint 分支：走 fal.ai，只改 mask 区域 ===
    if (isInpaint) {
      if (!maskImageUrl) {
        return NextResponse.json(
          { error: "Mask image is required for inpaint mode", code: "INVALID_REQUEST" },
          { status: 400 }
        )
      }
      try {
        const outputUrl = await inpaintWithFal(
          imageUrl,
          maskImageUrl,
          prompt.trim()
        )
        const newUsageCount = currentUsage + 1
        usageMap.set(anonymousId, newUsageCount)
        return NextResponse.json({
          success: true,
          images: [
            {
              type: "image_url",
              image_url: { url: outputUrl },
            },
          ],
          text: "",
          refinedPrompt: prompt.trim(),
          usage_count: newUsageCount,
          max_usage: MAX_USAGE,
          remaining: MAX_USAGE - newUsageCount,
        })
      } catch (err: any) {
        return NextResponse.json(
          {
            error: err.message || "Inpaint failed",
            code: "INPAINT_FAILED",
          },
          { status: 500 }
        )
      }
    }

    // 1. 改写 prompt（结构化模板 + 分支）
    const usage: ReferenceUsage = (referenceUsage as ReferenceUsage) || "none"
    const refinedPrompt = await rewritePrompt(
      prompt,
      usage,
      !!referenceImageUrl && !isPreComposited,
      !!annotatedImageUrl && !isPreComposited,
      annotationPosition,
      !!isPreComposited
    )

    // 2. 构造图像模型请求
    // 预合成模式：清洁原图 + 合成 mockup（供模型看位置/大小/设计提示）
    // 非合成模式：清洁原图 → 带标记图（如有）→ 参考图（如有）
    const content: any[] = [
      { type: "image_url", image_url: { url: imageUrl } },
    ]
    if (isPreComposited) {
      if (compositeImageUrl) {
        content.push({
          type: "image_url",
          image_url: { url: compositeImageUrl },
        })
      }
    } else {
      if (annotatedImageUrl) {
        content.push({
          type: "image_url",
          image_url: { url: annotatedImageUrl },
        })
      }
      if (referenceImageUrl) {
        content.push({
          type: "image_url",
          image_url: { url: referenceImageUrl },
        })
      }
    }
    content.push({ type: "text", text: refinedPrompt })

    const completion = await openai.chat.completions.create({
      model: IMAGE_MODEL,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    })

    const message = completion.choices[0]?.message
    const rawImages: any[] = (message as any)?.images || []
    const textContent = message?.content || ""

    // 3. 输出图落到 Storage（data URL → public URL），可选调用 Real-ESRGAN
    const processedImages: any[] = []
    for (let i = 0; i < rawImages.length; i++) {
      const img = rawImages[i]
      const url: string | undefined = img?.image_url?.url
      if (!url) continue

      let finalUrl = url
      try {
        if (url.startsWith("data:")) {
          const path = `outputs/${anonymousId}/${Date.now()}-${i}.png`
          finalUrl = await uploadDataUrlToStorage(url, path)
        }
      } catch (e) {
        console.error("Output upload failed, returning original URL:", e)
      }

      if (shouldUpscale && finalUrl.startsWith("http")) {
        try {
          finalUrl = await upscaleWithRealEsrgan(finalUrl)
        } catch (e) {
          console.error("Upscale failed, keeping non-upscaled output:", e)
        }
      }

      processedImages.push({
        type: "image_url",
        image_url: { url: finalUrl },
      })
    }

    const newUsageCount = currentUsage + 1
    usageMap.set(anonymousId, newUsageCount)

    return NextResponse.json({
      success: true,
      images: processedImages,
      text: textContent,
      refinedPrompt,
      usage_count: newUsageCount,
      max_usage: MAX_USAGE,
      remaining: MAX_USAGE - newUsageCount,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to generate image",
        code: "GENERATION_FAILED",
      },
      { status: 500 }
    )
  }
}
