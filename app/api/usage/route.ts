import { NextRequest, NextResponse } from "next/server"

const MAX_USAGE = 50

// 内存存储使用次数（serverless 冷启动会重置，演示用）
const usageMap = new Map<string, number>()

export async function GET(request: NextRequest) {
  try {
    const anonymousId = request.nextUrl.searchParams.get("anonymousId")

    if (!anonymousId) {
      return NextResponse.json({ error: "Anonymous ID is required" }, { status: 400 })
    }

    const usageCount = usageMap.get(anonymousId) ?? 0
    const remaining = Math.max(0, MAX_USAGE - usageCount)

    return NextResponse.json({
      usage_count: usageCount,
      max_usage: MAX_USAGE,
      remaining: remaining,
      quota_exceeded: usageCount >= MAX_USAGE
    })
  } catch (error: any) {
    console.error("Usage API error:", error)
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 })
  }
}
