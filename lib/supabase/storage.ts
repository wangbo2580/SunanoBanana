import { createClient } from "@supabase/supabase-js"

const BUCKET = "generator-images"

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("Supabase env vars missing")
  }
  return createClient(url, key)
}

export async function uploadDataUrlToStorage(
  dataUrl: string,
  path: string
): Promise<string> {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/)
  if (!match) {
    throw new Error("Invalid data URL")
  }
  const [, mime, base64] = match
  const buffer = Buffer.from(base64, "base64")

  const supabase = getClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: false,
  })
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
