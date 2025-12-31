import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

const MAX_USAGE = 2

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
    // 1. 验证用户身份
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Service unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please login to use this feature", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. 检查用户使用次数
    const { data: existingUsage, error: usageQueryError } = await supabase
      .from("user_usage")
      .select("usage_count")
      .eq("user_id", user.id)
      .single()

    let currentUsage = 0
    if (usageQueryError && usageQueryError.code !== "PGRST116") {
      console.error("Usage query error:", usageQueryError)
      return NextResponse.json(
        { error: "Failed to check usage", code: "USAGE_CHECK_FAILED" },
        { status: 500 }
      )
    }

    if (existingUsage) {
      currentUsage = existingUsage.usage_count
    }

    // 3. 检查是否超过额度
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

    // 4. 验证请求参数
    const { image, prompt } = await request.json()

    if (!image || !prompt) {
      return NextResponse.json(
        { error: "Image and prompt are required", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    // 5. 调用 AI API
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: image, // base64 data URL
              },
            },
          ],
        },
      ],
    })

    const message = completion.choices[0]?.message

    // Extract generated images from the response
    const images = (message as any)?.images || []
    const textContent = message?.content || ""

    // 6. 生成成功后，更新使用次数
    const newUsageCount = currentUsage + 1

    if (existingUsage) {
      // 更新现有记录
      const { error: updateError } = await supabase
        .from("user_usage")
        .update({ usage_count: newUsageCount })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("Usage update error:", updateError)
      }
    } else {
      // 插入新记录
      const { error: insertError } = await supabase
        .from("user_usage")
        .insert({ user_id: user.id, usage_count: 1 })

      if (insertError) {
        console.error("Usage insert error:", insertError)
      }
    }

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
