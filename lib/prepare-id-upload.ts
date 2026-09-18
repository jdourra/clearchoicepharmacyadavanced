import { resolveUploadMimeType } from "@/lib/upload-mime"

/** Stay under Vercel's ~4.5MB request-body cap, including multipart overhead. */
export const MAX_ID_UPLOAD_BYTES = 3.5 * 1024 * 1024
const TARGET_BYTES = 1.8 * 1024 * 1024
const MAX_EDGE = 2000

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
])

const PDF_TYPES = new Set(["application/pdf"])

const ID_TYPES = new Set([...IMAGE_TYPES, ...PDF_TYPES])

export const ID_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,image/*,application/pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf"

export function isAllowedIdUploadFile(file: File): boolean {
  return resolveUploadMimeType(file, ID_TYPES) !== null
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), "image/jpeg", quality)
  })
}

async function decodeImage(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file)
    } catch {
      // HEIC often fails here outside Safari — try HTMLImageElement next.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("decode"))
    }
    img.src = url
  })
}

async function compressToJpeg(file: File): Promise<File> {
  const source = await decodeImage(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas")
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  if ("close" in source && typeof source.close === "function") {
    source.close()
  }

  let quality = 0.82
  let blob = await canvasToJpegBlob(canvas, quality)
  while (blob.size > TARGET_BYTES && quality > 0.45) {
    quality -= 0.12
    blob = await canvasToJpegBlob(canvas, quality)
  }

  if (blob.size > MAX_ID_UPLOAD_BYTES) {
    throw new Error(
      "This photo is still too large after compression. Please retake it from a little farther away."
    )
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "id-photo"
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() })
}

/** Compress ID photos for upload; PDFs pass through if they fit the size cap. */
export async function prepareIdUploadFile(file: File): Promise<File> {
  if (resolveUploadMimeType(file, PDF_TYPES)) {
    if (file.size > MAX_ID_UPLOAD_BYTES) {
      throw new Error(
        "This PDF is too large (max about 3.5MB). Please photograph the front and back of your ID instead."
      )
    }
    return file
  }

  if (!resolveUploadMimeType(file, IMAGE_TYPES)) {
    throw new Error("Please upload a photo (JPEG, PNG, or HEIC) or a PDF of your ID.")
  }

  const alreadySmallJpeg =
    file.size <= TARGET_BYTES &&
    (file.type === "image/jpeg" || file.type === "image/jpg" || /\.jpe?g$/i.test(file.name))
  if (alreadySmallJpeg) return file

  try {
    return await compressToJpeg(file)
  } catch (err) {
    if (err instanceof Error && err.message.includes("too large after compression")) {
      throw err
    }
    if (file.size <= MAX_ID_UPLOAD_BYTES) {
      return file
    }
    throw new Error(
      "This iPhone photo could not be compressed. Use Take photo in this form, or upload a screenshot of your ID."
    )
  }
}

export function messageForIdUploadFailure(status: number, bodyError?: string): string {
  if (status === 413) {
    return "This photo is too large to upload. Please use Take photo in this form so it can be compressed."
  }
  if (bodyError) return bodyError
  return "Upload failed. Please try Take photo, or upload a JPEG / PNG / PDF under 3.5MB."
}
