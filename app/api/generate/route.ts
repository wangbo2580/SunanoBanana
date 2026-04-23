import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const MAX_USAGE = 50

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

export async function POST(request: NextRequest) {
  try {
    const { image, prompt, anonymousId, referenceImage } = await request.json()

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Anonymous ID is required", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    // 检查用户使用次数
    const currentUsage = usageMap.get(anonymousId) ?? 0

    if (currentUsage >= MAX_USAGE) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          code: "QUOTA_EXCEEDED",
          usage_count: currentUsage,
          max_usage: MAX_USAGE,
          remaining: 0
        },
        { status: 403 }
      )
    }

    // 验证请求参数
    if (!image || !prompt) {
      return NextResponse.json(
        { error: "Image and prompt are required", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    // 调用 AI API
    const content: any[] = [
      {
        type: "image_url",
        image_url: {
          url: image, // base64 data URL
        },
      },
    ]

    if (referenceImage) {
      content.push({
        type: "image_url",
        image_url: {
          url: referenceImage, // base64 data URL
        },
      })
    }

    content.push({
      type: "text",
      text: prompt,
    })

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content,
        },
      ],
    })

    const message = completion.choices[0]?.message

    // Extract generated images from the response
    const images = (message as any)?.images || []
    const textContent = message?.content || ""

    // 生成成功后，更新使用次数
    const newUsageCount = currentUsage + 1
    usageMap.set(anonymousId, newUsageCount)

    return NextResponse.json({
      success: true,
      images: images,
      text: textContent,
      usage_count: newUsageCount,
      max_usage: MAX_USAGE,
      remaining: MAX_USAGE - newUsageCount
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate image", code: "GENERATION_FAILED" },
      { status: 500 }
    )
  }
}
