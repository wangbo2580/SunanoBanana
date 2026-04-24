import { createClient } from "./client"

const BUCKET = "generator-images"

export async function uploadImage(
  file: File,
  anonymousId: string,
  kind: string = "main"
): Promise<string> {
  const supabase = createClient()
  const ext = (file.name.split(".").pop() || "png").toLowerCase()
  const path = `inputs/${anonymousId}/${kind}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/png",
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
