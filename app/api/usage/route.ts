import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const MAX_USAGE = 2

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 查询用户使用次数
    const { data: usage, error: usageError } = await supabase
      .from("user_usage")
      .select("usage_count")
      .eq("user_id", user.id)
      .single()

    if (usageError && usageError.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine for new users
      console.error("Usage query error:", usageError)
      return NextResponse.json({ error: "Failed to get usage" }, { status: 500 })
    }

    const usageCount = usage?.usage_count ?? 0
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
