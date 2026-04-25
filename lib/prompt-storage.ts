// ============================================================
// 提示词本地存储管理
// ============================================================

const STORAGE_KEY = "banana_pro_custom_prompts"

export interface CustomPrompts {
  [sceneId: string]: string
}

export function getAllCustomPrompts(): CustomPrompts {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getCustomPrompt(sceneId: string): string | null {
  const all = getAllCustomPrompts()
  return all[sceneId] || null
}

export function setCustomPrompt(sceneId: string, prompt: string): void {
  if (typeof window === "undefined") return
  const all = getAllCustomPrompts()
  all[sceneId] = prompt
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function resetCustomPrompt(sceneId: string): void {
  if (typeof window === "undefined") return
  const all = getAllCustomPrompts()
  delete all[sceneId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function resetAllCustomPrompts(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function hasCustomPrompt(sceneId: string): boolean {
  return !!getCustomPrompt(sceneId)
}
