import "server-only"
import { createReadStream } from "fs"
import { writeFile, unlink, mkdtemp } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import {
  SignatureRequestApi,
  EventCallbackRequest,
  EventCallbackHelper,
  SubSigningOptions,
} from "@dropbox/sign"
import { getDrDourraInboxEmail, PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"

export function isDropboxSignConfigured(): boolean {
  return Boolean(process.env.DROPBOX_SIGN_API_KEY?.trim())
}

export function isDropboxSignTestMode(): boolean {
  const raw = process.env.DROPBOX_SIGN_TEST_MODE?.trim().toLowerCase()
  if (raw === "false" || raw === "0") return false
  return true
}

function getApi(): SignatureRequestApi {
  const api = new SignatureRequestApi()
  api.username = process.env.DROPBOX_SIGN_API_KEY!.trim()
  return api
}

export async function sendPrescriptionForSignature(params: {
  pdfBytes: Uint8Array
  fileName: string
  title: string
  subject: string
  message: string
  metadata: Record<string, string>
}): Promise<{ signatureRequestId: string; testMode: boolean }> {
  if (!isDropboxSignConfigured()) {
    throw new Error("DROPBOX_SIGN_API_KEY is not configured")
  }

  const signerEmail =
    getDrDourraInboxEmail() ||
    process.env.DROPBOX_SIGN_SIGNER_EMAIL?.trim().toLowerCase() ||
    ""
  if (!signerEmail) {
    throw new Error("Set TELEHEALTH_CLINICIAN_EMAIL / DR_DOURRA_EMAIL for the Dropbox Sign signer")
  }

  const dir = await mkdtemp(join(tmpdir(), "ccp-rx-"))
  const filePath = join(dir, params.fileName)
  await writeFile(filePath, Buffer.from(params.pdfBytes))

  try {
    const api = getApi()
    const testMode = isDropboxSignTestMode()
    const clientId = process.env.DROPBOX_SIGN_CLIENT_ID?.trim() || undefined

    const result = await api.signatureRequestSend({
      title: params.title,
      subject: params.subject,
      message: params.message,
      clientId,
      signers: [
        {
          emailAddress: signerEmail,
          name: PRIMARY_PHYSICIAN.name,
          order: 0,
        },
      ],
      files: [createReadStream(filePath)],
      metadata: params.metadata,
      testMode,
      formFieldsPerDocument: [
        {
          documentIndex: 0,
          apiId: "clinician_signature",
          type: "signature",
          name: "Clinician signature",
          x: 48,
          y: 620,
          width: 220,
          height: 40,
          required: true,
          signer: 0,
          page: 1,
        },
      ],
      signingOptions: {
        draw: true,
        type: true,
        upload: false,
        phone: false,
        defaultType: SubSigningOptions.DefaultTypeEnum.Draw,
      },
    })

    const signatureRequestId = result.body.signatureRequest?.signatureRequestId
    if (!signatureRequestId) {
      throw new Error("Dropbox Sign did not return a signature_request_id")
    }

    return { signatureRequestId, testMode }
  } finally {
    await unlink(filePath).catch(() => undefined)
  }
}

export async function downloadSignedPrescriptionPdf(
  signatureRequestId: string
): Promise<Buffer> {
  if (!isDropboxSignConfigured()) {
    throw new Error("DROPBOX_SIGN_API_KEY is not configured")
  }
  const api = getApi()
  const response = await api.signatureRequestFiles(signatureRequestId, "pdf")
  const body = response.body as unknown
  if (Buffer.isBuffer(body)) return body
  if (body instanceof Uint8Array) return Buffer.from(body)
  throw new Error("Unexpected Dropbox Sign file response")
}

export function verifyDropboxSignCallback(rawJson: string): {
  valid: boolean
  eventType: string
  signatureRequestId: string | null
} {
  const parsed = JSON.parse(rawJson) as Record<string, unknown>
  const callbackEvent = EventCallbackRequest.init(parsed)
  const apiKey = process.env.DROPBOX_SIGN_API_KEY?.trim() || ""
  const valid = apiKey ? EventCallbackHelper.isValid(apiKey, callbackEvent) : false

  const eventType = String(callbackEvent.event?.eventType ?? "")
  const signatureRequestId = callbackEvent.signatureRequest?.signatureRequestId
    ? String(callbackEvent.signatureRequest.signatureRequestId)
    : null

  return { valid, eventType, signatureRequestId }
}

export const DROPBOX_SIGN_CALLBACK_ACK = "Hello API Event Received"
