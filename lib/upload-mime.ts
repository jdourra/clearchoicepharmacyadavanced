const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
}

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
}

function normalizeMime(type: string): string {
  const lower = type.toLowerCase().trim()
  return MIME_ALIASES[lower] || lower
}

function mimeFromExtension(filename: string): string | undefined {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  return ext ? EXT_TO_MIME[ext] : undefined
}

/** Resolve a browser File's MIME type when mobile sends empty or application/octet-stream. */
export function resolveUploadMimeType(
  file: { name: string; type: string },
  allowed: Set<string>,
  fallback?: string
): string | null {
  const raw = (file.type || "").toLowerCase().trim()

  if (raw && raw !== "application/octet-stream") {
    const normalized = normalizeMime(raw)
    if (allowed.has(normalized)) return normalized
  }

  const fromExt = mimeFromExtension(file.name)
  if (fromExt && allowed.has(fromExt)) return fromExt

  if (fallback && allowed.has(fallback)) return fallback

  return null
}

export function isAllowedUploadFile(
  file: { name: string; type: string },
  allowed: Set<string>,
  fallback?: string
): boolean {
  return resolveUploadMimeType(file, allowed, fallback) !== null
}
