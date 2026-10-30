import "server-only"
import { getOlaConfig, type OlaConfig, type OlaPharmacyDetails } from "@/lib/ola/config"

export class OlaApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "OlaApiError"
    this.status = status
  }
}

export type OlaScheduleSlot = {
  scheduleDate: string
  scheduleStart: string
  scheduleEnd: string
  providerGuid: string
}

type TokenCache = { token: string; exp: number }
let tokenCache: TokenCache | null = null

function authHeaders(token: string, tenant: string, json = true): Record<string, string> {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    "X-Access-Token": token,
    tenant,
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { code?: unknown; message?: unknown }
    const code = typeof body.code === "string" ? body.code : ""
    const message = typeof body.message === "string" ? body.message : ""
    return [code, message].filter(Boolean).join(": ") || `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

async function accessToken(config: OlaConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (tokenCache && tokenCache.exp - 60 > now) return tokenCache.token

  const response = await fetch(`${config.baseUrl}/api/v1/service/auth/tenant/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", tenant: config.tenant },
    body: JSON.stringify({
      auth_token: config.authToken,
      secret_token: config.secretToken,
    }),
  })

  if (!response.ok) {
    throw new OlaApiError(await errorMessage(response), response.status)
  }

  const body = (await response.json()) as { result?: { token?: string } }
  const token = body.result?.token
  if (!token) throw new OlaApiError("Clinician network login did not return a token", 502)

  let exp = now + 1500
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] || "", "base64url").toString()) as {
      exp?: number
    }
    if (typeof payload.exp === "number") exp = payload.exp
  } catch {
    exp = now + 1500
  }

  tokenCache = { token, exp }
  return token
}

export type OlaPatientInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  gender: "male" | "female" | "other"
  street: string
  city: string
  state: string
  postalCode: string
  allergies?: string[]
}

export async function createOlaPatient(input: OlaPatientInput): Promise<string> {
  const config = getOlaConfig()
  if (!config) throw new OlaApiError("Clinician network is not configured", 503)
  const token = await accessToken(config)
  const response = await fetch(`${config.baseUrl}/api/v1/service/patients`, {
    method: "POST",
    headers: authHeaders(token, config.tenant),
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      address: {
        street: input.street,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: "US",
      },
      dob: input.dob,
      gender: input.gender,
      tenant_name: config.tenant,
      ...(input.allergies && input.allergies.length > 0 ? { allergies: input.allergies } : {}),
    }),
  })

  if (!response.ok) {
    throw new OlaApiError(await errorMessage(response), response.status)
  }

  const body = (await response.json()) as { result?: { patient_guid?: string } }
  const patientGuid = body.result?.patient_guid
  if (!patientGuid) throw new OlaApiError("Clinician network did not return a patient id", 502)
  return patientGuid
}

export type OlaConsultInput = {
  patientGuid: string
  questions: { question_text: string; answer: string; selection_option?: string }[]
  serviceKey: string
  sessionType: "initial" | "sync"
  scheduleType: "subscription" | "one-time"
  transactionId: string
  pharmacy: OlaPharmacyDetails
  schedule?: {
    scheduleStart: string
    scheduleEnd: string
    providerGuid: string
  }
}

export async function createOlaConsult(input: OlaConsultInput): Promise<string> {
  const config = getOlaConfig()
  if (!config) throw new OlaApiError("Clinician network is not configured", 503)
  const token = await accessToken(config)
  const response = await fetch(`${config.baseUrl}/api/v1/service/consults`, {
    method: "POST",
    headers: authHeaders(token, config.tenant),
    body: JSON.stringify({
      patient_guid: input.patientGuid,
      questions: input.questions,
      service: {
        service_key: input.serviceKey,
        session_type: input.sessionType,
        tenant_name: config.tenant,
        schedule_type: input.scheduleType,
      },
      transaction_id: input.transactionId,
      pharmacy_details: {
        name: input.pharmacy.name,
        address: input.pharmacy.address,
        phone: input.pharmacy.phone,
      },
      ...(input.schedule
        ? {
            schedules: {
              schedule_start_date: input.schedule.scheduleStart,
              schedule_end_date: input.schedule.scheduleEnd,
              provider_guid: input.schedule.providerGuid,
            },
          }
        : {}),
    }),
  })

  if (!response.ok) {
    throw new OlaApiError(await errorMessage(response), response.status)
  }

  const body = (await response.json()) as { result?: { order_guid?: string } }
  const orderGuid = body.result?.order_guid
  if (!orderGuid) throw new OlaApiError("Clinician network did not return a consult id", 502)
  return orderGuid
}

export async function uploadOlaConsultFiles(
  orderGuid: string,
  files: { filename: string; contentType: string; body: Buffer }[]
): Promise<void> {
  if (files.length === 0) return
  const config = getOlaConfig()
  if (!config) throw new OlaApiError("Clinician network is not configured", 503)
  const token = await accessToken(config)
  const form = new FormData()
  files.forEach((file, index) => {
    form.append(
      `file${index + 1}`,
      new Blob([new Uint8Array(file.body)], { type: file.contentType || "application/octet-stream" }),
      file.filename
    )
  })

  const response = await fetch(
    `${config.baseUrl}/api/v1/service/consults/${encodeURIComponent(orderGuid)}/upload-files`,
    {
      method: "POST",
      headers: authHeaders(token, config.tenant, false),
      body: form,
    }
  )

  if (!response.ok) {
    throw new OlaApiError(await errorMessage(response), response.status)
  }
}

export async function listOlaScheduleSlots(stateCode: string): Promise<OlaScheduleSlot[]> {
  const config = getOlaConfig()
  if (!config) throw new OlaApiError("Clinician network is not configured", 503)
  const token = await accessToken(config)
  const response = await fetch(
    `${config.baseUrl}/api/v1/service/schedules/${encodeURIComponent(stateCode)}/${encodeURIComponent(config.syncServiceId)}`,
    { headers: authHeaders(token, config.tenant, false) }
  )

  if (response.status === 404) return []
  if (!response.ok) {
    throw new OlaApiError(await errorMessage(response), response.status)
  }

  const body = (await response.json()) as {
    result?: {
      schedule_date?: string
      start_datetime?: string
      end_datetime?: string
      provider_guid?: string
    }[]
  }

  return (body.result || [])
    .filter((slot) => slot.start_datetime && slot.end_datetime && slot.provider_guid)
    .map((slot) => ({
      scheduleDate: slot.schedule_date || "",
      scheduleStart: slot.start_datetime || "",
      scheduleEnd: slot.end_datetime || "",
      providerGuid: slot.provider_guid || "",
    }))
}
